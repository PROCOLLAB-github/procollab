/** @format */

import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const yearRangeValidators = (
  entryYearValue: string,
  completionYearValue: string
): ValidatorFn => {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const entryYearControl = formGroup.get(entryYearValue);
    const completionYearControl = formGroup.get(completionYearValue);

    if (!entryYearControl || !completionYearControl) {
      return null;
    }

    const entryYear = entryYearControl.value;
    const completionYear = completionYearControl.value;

    if (entryYear == null || completionYear == null) {
      return null;
    }

    return entryYear > completionYear
      ? { yearRangeError: "Год начала должен быть меньше года окончания" }
      : null;
  };
};
