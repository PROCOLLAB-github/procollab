/** @format */

import { solutionFieldsGroup } from "./solution-field-controls";
import { hasSolutionAnswer } from "@domain/solution/solution-values";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { SolutionForm } from "@domain/solution/solution-contract.model";
const form = solutionContractScenarios.find(s => s.name === "form")!.response as SolutionForm;
describe("Значения полей решения", () => {
  it("distinguishes missing from zero and false", () => {
    expect(hasSolutionAnswer(0)).toBe(true);
    expect(hasSolutionAnswer(false)).toBe(true);
    for (const value of [null, undefined, "", "  "]) expect(hasSolutionAnswer(value)).toBe(false);
  });
  it("does not choose a case implicitly", () => {
    const group = solutionFieldsGroup(form.fields);
    expect(group.get(String(form.fields[0].id))!.value).toBeNull();
  });
  it("restores exact false and zero values without required-checkbox coercion", () => {
    const number = form.fields.find(field => field.type === "number")!,
      checkbox = form.fields.find(field => field.type === "checkbox")!;
    const group = solutionFieldsGroup(
      [number, checkbox],
      [
        { fieldId: number.id, value: 0 },
        { fieldId: checkbox.id, value: false },
      ],
    );
    expect(group.get(String(number.id))!.value).toBe(0);
    expect(group.get(String(checkbox.id))!.value).toBe(false);
    expect(group.valid).toBe(true);
  });
  it("retains invalid values for correction instead of silently replacing the selection", () => {
    const field = form.fields[0],
      group = solutionFieldsGroup([field], [{ fieldId: field.id, value: "Удаленный выбор" }]);
    expect(group.get(String(field.id))!.value).toBe("Удаленный выбор");
    expect(group.valid).toBe(false);
  });
});
