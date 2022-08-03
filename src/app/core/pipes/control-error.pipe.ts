/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import { AbstractControl, ValidationErrors } from "@angular/forms";

@Pipe({
  name: "controlError",
  /**
   * Otherwise, don't work
   */
  pure: false,
})
export class ControlErrorPipe implements PipeTransform {
  transform(value: AbstractControl, errorName?: keyof ValidationErrors): boolean {
    if (!errorName) {
      return value.touched && value.invalid;
    }

    return value.touched && (value.errors ? value.errors[errorName] : false);
  }
}
