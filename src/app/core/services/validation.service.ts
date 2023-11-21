/** @format */

import { Injectable } from "@angular/core";
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
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
      const controls = [group.get(left), group.get(right)];
      if (!controls.every(Boolean)) {
        throw new Error(`No control with name ${left} or ${right}`);
      }
      const isMatching = controls[0]?.value === controls[1]?.value;
      if (!isMatching) {
        controls.forEach(c => c?.setErrors({ ...(c.errors || {}), unMatch: true }));
        return { unMatch: true };
      }
      controls.forEach(c => {
        if (c?.errors) {
          delete c.errors?.["unMatch"];
          if (!Object.keys(c.errors).length) {
            c.setErrors(null);
          }
        }
      });
      return null;
    };
  }

  useDateFormatValidator(control: AbstractControl): ValidationErrors | null {
    try {
      const value = dayjs(control.value, "DD.MM.YYYY", true);
      if (control.value && (value.fromNow().includes("in") || !value.isValid())) {
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

  useLanguageValidator(): ValidatorFn {
    return control => {
      return control.value.match(/^[А-Яа-я]*$/g) ? null : { invalidLanguage: true };
    };
  }

  getFormValidation(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    }

    Object.keys(form.controls).forEach(controlName => {
      const control = form.get(controlName);
      control && control.markAsTouched({ onlySelf: true });
    });

    return false;
  }
}
