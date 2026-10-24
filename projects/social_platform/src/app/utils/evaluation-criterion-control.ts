/** @format */

import { AbstractControl, FormControl, Validators } from "@angular/forms";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";

/** One validation contract for real expert forms and organizer preview. */
export function evaluationCriterionControl(c: ProjectRatingCriterion): FormControl {
  if (c.type === "bool") {
    const value =
      c.value == null || c.value === "" ? null : String(c.value).toLowerCase() === "true";
    return new FormControl(value, Validators.required);
  }
  if (c.type === "str") return new FormControl(c.value ?? "", Validators.maxLength(1000));
  const validators = [
    Validators.required,
    (control: AbstractControl) => {
      if (control.value === null || control.value === "") return null;
      const value = Number(control.value);
      return !Number.isFinite(value) || (c.type === "int" && !Number.isInteger(value))
        ? { numeric: true }
        : null;
    },
  ];
  if (c.minValue !== null && c.minValue !== undefined) validators.push(Validators.min(c.minValue));
  if (c.maxValue !== null && c.maxValue !== undefined) validators.push(Validators.max(c.maxValue));
  return new FormControl(c.value === "" || c.value == null ? null : Number(c.value), validators);
}
