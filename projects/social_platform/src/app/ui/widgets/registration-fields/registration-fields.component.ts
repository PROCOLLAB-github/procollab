/** @format */
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { FormControl, FormRecord, ReactiveFormsModule, Validators } from "@angular/forms";
import { FieldDirective, ChoiceDirective } from "@uilib";
import { RegistrationField, RegistrationValue } from "@domain/program/program-registration.model";
import { russianRegions } from "@core/consts/lists/russian-regions-list.const";
import { UniversitySelectComponent } from "@ui/pages/profile/edit/components/university-select/university-select.component";
export function registrationControls(
  fields: RegistrationField[],
  values: Record<string, RegistrationValue> = {},
) {
  return new FormRecord<FormControl<RegistrationValue>>(
    Object.fromEntries(
      fields.map(field => [
        field.id,
        new FormControl<RegistrationValue>(
          values[field.id] ?? (field.type === "multiselect" ? [] : ""),
          field.required ? [Validators.required] : [],
        ),
      ]),
    ),
  );
}
@Component({
  selector: "app-registration-fields",
  imports: [ReactiveFormsModule, FieldDirective, ChoiceDirective, UniversitySelectComponent],
  templateUrl: "./registration-fields.component.html",
  styleUrl: "./registration-fields.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationFieldsComponent {
  readonly fields = input.required<RegistrationField[]>();
  readonly group = input.required<FormRecord<FormControl<RegistrationValue>>>();
  readonly errors = input<Record<string, string>>({});
  readonly prefix = input("answer");
  readonly regions = [...russianRegions];
  control(field: RegistrationField) {
    return this.group().controls[field.id];
  }
  choices(field: RegistrationField) {
    return field.source === "regions" ? this.regions : field.options;
  }
  selected(field: RegistrationField, value: string) {
    const current = this.control(field).value;
    return Array.isArray(current) && current.includes(value);
  }
  toggle(field: RegistrationField, value: string, checked: boolean) {
    const control = this.control(field),
      values = control.value;
    control.setValue(
      checked
        ? [...(Array.isArray(values) ? values : []), value]
        : (Array.isArray(values) ? values : []).filter(v => v !== value),
    );
    control.markAsTouched();
    control.markAsDirty();
  }
  other(field: RegistrationField): string | null {
    const value = this.control(field).value;
    const other = Array.isArray(value)
      ? value.find(v => v.startsWith("Другое: "))
      : typeof value === "string" && value.startsWith("Другое: ")
        ? value
        : null;
    return other ? other.slice(8) : null;
  }
  setOther(field: RegistrationField, text: string) {
    const control = this.control(field);
    control.setValue(
      field.type === "multiselect"
        ? [
            ...(Array.isArray(control.value) ? control.value : []).filter(
              v => !v.startsWith("Другое: "),
            ),
            "Другое: " + text,
          ]
        : "Другое: " + text,
    );
    control.markAsDirty();
    control.markAsTouched();
  }
  select(field: RegistrationField, value: string) {
    this.control(field).setValue(value === "__other__" ? "Другое: " : value);
    this.control(field).markAsDirty();
    this.control(field).markAsTouched();
  }
  addUniversity(field: RegistrationField, value: string) {
    if (value && !this.selected(field, value)) this.toggle(field, value, true);
  }
  readonly pickers = new Map<string, FormControl<string | null>>();
  picker(field: RegistrationField) {
    let control = this.pickers.get(field.id);
    if (!control) {
      control = new FormControl<string>("");
      if (this.control(field).disabled) control.disable();
      this.pickers.set(field.id, control);
      control.valueChanges.subscribe(value => this.addUniversity(field, value ?? ""));
    }
    return control;
  }
}
