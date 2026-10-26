/** @format */

import { rebaseSolutionFields } from "./solution-form-rebase";
import { solutionContractScenarios } from "./solution-contract.fixture";
import { SolutionForm } from "./solution-contract.model";
const form = solutionContractScenarios.find(s => s.name === "form")!.response as SolutionForm;
describe("Разрешение конфликта формы", () => {
  it("preserves a remote reorder when only the local label changed", () => {
    const base = structuredClone(form.fields),
      local = base.map(field => ({ ...structuredClone(field), clientKey: field.id }));
    local[0].label = "Локальная подпись";
    const remote = [...structuredClone(base)].reverse();
    const result = rebaseSolutionFields(base, local, remote);
    expect(result.fields.map(field => field.id)).toEqual(remote.map(field => field.id));
    expect(result.fields.find(field => field.id === base[0].id)!.label).toBe("Локальная подпись");
  });
  it("keeps local labels, remote help, added choices and new remote fields", () => {
    const base = structuredClone(form.fields),
      local = base.map(field => ({ ...structuredClone(field), clientKey: field.id }));
    local[0].label = "Моя задача";
    local[0].options.push("Мой трек");
    const remote = structuredClone(base);
    remote[0].helpText = "Подсказка коллеги";
    remote[0].options.push("Трек коллеги");
    remote.push({ ...remote[1], id: 9999 });
    const result = rebaseSolutionFields(base, local, remote);
    expect(result.fields[0].label).toBe("Моя задача");
    expect(result.fields[0].helpText).toBe("Подсказка коллеги");
    expect(result.fields[0].options).toContain("Трек коллеги");
    expect(result.fields[0].options).toContain("Мой трек");
    expect(result.fields.some(field => field.id === 9999)).toBe(true);
  });
  it("does not hide a locally edited field that was deleted remotely", () => {
    const base = structuredClone(form.fields),
      local = base.map(field => ({ ...structuredClone(field), clientKey: field.id }));
    local[1].label = "Мой ввод";
    const result = rebaseSolutionFields(
      base,
      local,
      base.filter(field => field.id !== base[1].id),
    );
    expect(result.missing).toContain(base[1].id);
    expect(result.fields.some(field => field.label === "Мой ввод")).toBe(true);
  });
  it("drops unedited remote deletions and preserves local deletion", () => {
    const base = structuredClone(form.fields),
      local = base
        .filter((_, index) => index !== 2)
        .map(field => ({ ...structuredClone(field), clientKey: field.id }));
    const result = rebaseSolutionFields(
      base,
      local,
      base.filter((_, index) => index !== 1),
    );
    expect(result.fields.some(field => field.id === base[1].id)).toBe(false);
    expect(result.fields.some(field => field.id === base[2].id)).toBe(false);
  });
});
