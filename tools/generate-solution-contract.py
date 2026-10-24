"""Генерация типов и независимых моков из зафиксированного C00 без сети."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs/contracts/program-solutions-v1"
APP = ROOT / "projects/social_platform/src/app"
spec = json.loads((DOCS / "openapi.json").read_text(encoding="utf-8"))
examples = json.loads((DOCS / "examples.json").read_text(encoding="utf-8"))


def camel(value):
    return re.sub(r"_([a-z])", lambda m: m[1].upper(), value)


def name(value):
    special = {"Solution": "ProgramSolution", "Context": "SolutionContext", "Error": "SolutionApiError",
               "CreateSolution": "CreateSolutionCommand", "UpdateSolution": "UpdateSolutionCommand",
               "Submit": "SubmitSolutionCommand"}
    return special.get(value, value if value.startswith("Solution") else "Solution" + value)


def ts(schema):
    if "$ref" in schema:
        return name(schema["$ref"].split("/")[-1])
    if "const" in schema:
        return json.dumps(schema["const"], ensure_ascii=False)
    if "enum" in schema:
        return " | ".join(json.dumps(v, ensure_ascii=False) for v in schema["enum"])
    for key, separator in [("anyOf", " | "), ("oneOf", " | "), ("allOf", " & ")]:
        if key in schema:
            if schema.get("properties"):
                base = {k: v for k, v in schema.items() if k != key}
                if key in ("anyOf", "oneOf"):
                    # required-only ветви уточняют общий объект, а не заменяют его unknown.
                    variants = []
                    for branch in schema[key]:
                        if set(branch) <= {"required", "properties", "type"}:
                            combined = {**base, **branch,
                                        "properties": {**base["properties"], **branch.get("properties", {})},
                                        "required": sorted(set(base.get("required", [])) | set(branch.get("required", [])))}
                            variants.append(ts(combined))
                        else:
                            variants.append("(" + ts(base) + ") & (" + ts(branch) + ")")
                    return separator.join("(" + variant + ")" for variant in variants)
                return "(" + ts(base) + ") & " + separator.join("(" + ts(v) + ")" for v in schema[key])
            return separator.join("(" + ts(v) + ")" for v in schema[key])
    kind = schema.get("type")
    if isinstance(kind, list):
        return " | ".join(ts({**schema, "type": item}) for item in kind)
    if kind == "array":
        return "Array<" + ts(schema.get("items", {})) + ">"
    if kind == "object":
        props = schema.get("properties", {})
        if not props:
            return "Record<string, unknown>"
        required = schema.get("required", [])
        return "{\n" + "\n".join("  " + camel(k) + ("" if k in required else "?") + ": " + ts(v) + ";" for k, v in props.items()) + "\n}"
    return {"string": "string", "integer": "number", "number": "number", "boolean": "boolean", "null": "null"}.get(kind, "unknown")


types = f"// Сгенерировано tools/generate-solution-contract.py из C00 {spec['info']['version']}.\n// camelCase соответствует CamelcaseInterceptor; значения ID и revision не преобразуются.\n\n"
types += "\n\n".join("export type " + name(k) + " = " + ts(v) + ";" for k, v in spec["components"]["schemas"].items()) + "\n"
model = APP / "domain/solution/solution-contract.model.ts"
model.parent.mkdir(parents=True, exist_ok=True)
model.write_text(types, encoding="utf-8")


def convert(obj):
    if isinstance(obj, dict):
        return {camel(k): convert(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert(v) for v in obj]
    return obj


fixtures = APP / "domain/solution/solution-contract.fixture.ts"
fixtures.parent.mkdir(parents=True, exist_ok=True)
fixtures.write_text("// Независимые сценарии C00; не последовательность запросов и не production mock provider.\n"
                    "export type SolutionContractScenario = { name: string; operationId: string; status: number; request?: unknown; response?: unknown };\n"
                    "export const solutionContractScenarios: SolutionContractScenario[] = "
                    + json.dumps(convert(examples["scenarios"]), ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
print(f"Generated {len(spec['components']['schemas'])} types and {len(examples['scenarios'])} scenarios")
