/** @format */

import { FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { SolutionField, SolutionAnswerValue } from "@domain/solution/solution-contract.model";
import { hasSolutionAnswer } from "@domain/solution/solution-values";

export type SolutionControlValue = SolutionAnswerValue | null;
export function solutionFieldControl(field: SolutionField, value: SolutionControlValue = null) {
  const rules: ValidatorFn[] = [];
  const validation = field.validation;
  if (["text", "textarea", "url"].includes(field.type)) {
    if (validation.minLength !== null) rules.push(Validators.minLength(validation.minLength));
    if (validation.maxLength !== null) rules.push(Validators.maxLength(validation.maxLength));
  }
  if (field.type === "number") {
    if (validation.minimum !== null) rules.push(Validators.min(validation.minimum));
    if (validation.maximum !== null) rules.push(Validators.max(validation.maximum));
  }
  if (["select", "radio"].includes(field.type)) {
    rules.push(control =>
      !hasSolutionAnswer(control.value) || field.options.includes(control.value)
        ? null
        : { choice: true },
    );
  }
  if (field.type === "url")
    rules.push(control => {
      if (!hasSolutionAnswer(control.value)) return null;
      try {
        const url = new URL(control.value);
        return ["http:", "https:"].includes(url.protocol) &&
          !url.username &&
          !url.password &&
          !/\s/.test(control.value)
          ? null
          : { url: true };
      } catch {
        return { url: true };
      }
    });
  return new FormControl<SolutionControlValue>(value, rules);
}
export function solutionFieldsGroup(
  fields: SolutionField[],
  answers: { fieldId: number; value: SolutionAnswerValue }[] = [],
) {
  const group = new FormGroup<Record<string, FormControl<SolutionControlValue>>>({});
  for (const field of fields)
    group.addControl(
      String(field.id),
      solutionFieldControl(
        field,
        answers.find(answer => answer.fieldId === field.id)?.value ?? null,
      ),
    );
  return group;
}
