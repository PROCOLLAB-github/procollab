/** @format */

import { Injectable } from "@angular/core";
import { AnyForUntypedForms, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: "root"
})
export class ValidationService {
  constructor() {
  }

  useMatchValidator(left: string, right: string): ValidatorFn {
    return group => {
      if (!group.get(left) || !group.get(right)) {
        throw new Error(`No control with name ${left} or ${right}`);
      }

      return group.get(left)?.value !== group.get(right)?.value ? { unMatch: true } : null;
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
