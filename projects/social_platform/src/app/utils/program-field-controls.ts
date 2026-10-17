/** @format */

import { FormControl, ValidatorFn, Validators } from "@angular/forms";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

/** The same controls are used by the team and the organizer's local preview. */
export function programFieldControl(field: PartnerProgramFields, value: unknown = ""): FormControl {
  const required = field.isRequired || field.name === "case";
  const validators: ValidatorFn[] = [];
  if (required)
    validators.push(control =>
      control.value == null || String(control.value).trim() === "" ? { required: true } : null,
    );
  if (field.fieldType === "select" || field.fieldType === "radio")
    validators.push(control =>
      !control.value || field.options.includes(String(control.value))
        ? null
        : field.name === "case"
          ? { caseUnavailable: true }
          : { choiceUnavailable: true },
    );
  if (field.fieldType === "text") validators.push(Validators.maxLength(500));
  if (field.fieldType === "textarea") validators.push(Validators.maxLength(300));
  if (field.fieldType === "checkbox")
    value = value === true || (typeof value === "string" && value.toLowerCase() === "true");
  return new FormControl(value ?? "", validators);
}

export const PROGRAM_FIELD_TYPE_LABELS: Record<PartnerProgramFields["fieldType"], string> = {
  text: "Короткий текст",
  textarea: "Развёрнутый текст",
  select: "Выбор из списка",
  file: "Файл",
  checkbox: "Флажок",
  radio: "Один вариант",
};
