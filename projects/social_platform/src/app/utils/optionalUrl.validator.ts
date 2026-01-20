/** @format */

import { AbstractControl, ValidationErrors } from "@angular/forms";

export const optionalUrlOrMentionValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const value: string = control.value;

  if (!value.trim()) {
    return null;
  }

  const isUrl = /^https?:\/\/.+$/.test(value);
  const isMention = /^@[a-zA-Z0-9_]+$/.test(value);

  return isUrl || isMention ? null : { invalidLink: true };
};
