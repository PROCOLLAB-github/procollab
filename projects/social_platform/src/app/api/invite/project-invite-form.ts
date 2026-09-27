/** @format */
import { FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { normalizeInviteText } from "@domain/invite/project-role-suggestions";

export const inviteRoleValidator: ValidatorFn = control => {
  const value = normalizeInviteText(control.value ?? "");
  if (!value) return { required: true };
  return value.length > 128
    ? { maxlength: { requiredLength: 128, actualLength: value.length } }
    : null;
};

/** Форма создания приглашения хранит ID получателя; legacy specialization остаётся в редактировании. */
export function createProjectInviteForm() {
  return new FormGroup({
    recipientId: new FormControl<number | null>(null, [
      Validators.required,
      control =>
        control.value !== null && (!Number.isSafeInteger(control.value) || control.value <= 0)
          ? { recipient: true }
          : null,
    ]),
    role: new FormControl("", { nonNullable: true, validators: [inviteRoleValidator] }),
  });
}
export type ProjectInviteForm = ReturnType<typeof createProjectInviteForm>;
