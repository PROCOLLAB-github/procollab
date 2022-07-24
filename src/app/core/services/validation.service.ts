/** @format */

import { Injectable } from "@angular/core";
import { ValidatorFn } from "@angular/forms";

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

      // @ts-ignore
      return group.get(left).value !== group.get(right).value ? { unMatch: true } : null;
    };
  }
}
