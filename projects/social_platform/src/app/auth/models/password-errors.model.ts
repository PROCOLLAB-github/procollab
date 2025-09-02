/** @format */

import { ValidationErrors } from "@angular/forms";

export interface PasswordValidationErrors extends ValidationErrors {
  passwordTooShort?: { requiredLength: number; actualLength: number };
  passwordNoUppercase?: { message: string };
  passwordNoLowercase?: { message: string };
  passwordNoNumber?: { message: string };
  passwordNoSpecialChar?: { message: string };
  passwordHasSpaces?: { message: string };
  passwordHasSequence?: { message: string };
  passwordHasRepeating?: { message: string };
}
