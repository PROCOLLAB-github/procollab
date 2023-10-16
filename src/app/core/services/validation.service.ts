/** @format */

import { Injectable } from "@angular/core";
import { AbstractControl, AnyForUntypedForms, ValidationErrors, ValidatorFn } from "@angular/forms";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import * as relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(cpf);
dayjs.extend(relativeTime);

@Injectable({
  providedIn: "root",
})
export class ValidationService {
  constructor() {}

  useMatchValidator(left: string, right: string): ValidatorFn {
    return group => {
      if (!group.get(left) || !group.get(right)) {
        throw new Error(`No control with name ${left} or ${right}`);
      }

      return group.get(left)?.value !== group.get(right)?.value ? { unMatch: true } : null;
    };
  }

  useDateFormatValidator(control: AbstractControl): ValidationErrors | null {
    try {
      const value = dayjs(control.value, "DD.MM.YYYY", true);
      if (value.fromNow().includes("in") || !value.isValid()) {
        return { invalidDateFormat: true };
      }
      return null;
    } catch (e) {
      return { invalidDateFormat: true };
    }
  }

  useAgeValidator(age = 12): ValidatorFn {
    return control => {
      const value = dayjs(control.value, "DD.MM.YYYY", true);
      if (value.isValid()) {
        const difference = dayjs().diff(value, "year");
        return difference >= age ? null : { tooYoung: { requiredAge: age } };
      }
      return null;
    };
  }

  getFormValidation(form: AnyForUntypedForms): boolean {
    if (form.valid) {
      return true;
    }

    Object.keys(form.controls).forEach(control =>
      form.get(control).markAsTouched({ onlySelf: true })
    );

    return false;
  }
}
