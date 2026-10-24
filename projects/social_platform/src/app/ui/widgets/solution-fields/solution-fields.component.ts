/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ButtonDirective, FieldDirective, ChoiceDirective, IconComponent } from "@uilib";
import { SolutionField } from "@domain/solution/solution-contract.model";
import { hasSolutionAnswer } from "@domain/solution/solution-values";

@Component({
  selector: "app-solution-fields",
  imports: [ReactiveFormsModule, ButtonDirective, FieldDirective, ChoiceDirective, IconComponent],
  templateUrl: "./solution-fields.component.html",
  styleUrl: "./solution-fields.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionFieldsComponent {
  readonly fields = input.required<SolutionField[]>();
  readonly group = input.required<FormGroup>();
  readonly readonly = input(false);
  readonly preview = input(false);
  readonly busy = input(false);
  readonly attempted = input(false);
  readonly errors = input<Record<number, string>>({});
  readonly upload = output<{ fieldId: number; file: File }>();
  readonly clearFile = output<number>();
  readonly hasAnswer = hasSolutionAnswer;
  control(field: SolutionField) {
    return this.group().get(String(field.id));
  }
  value(field: SolutionField): unknown {
    return this.control(field)?.value;
  }
  labelValue(field: SolutionField): string {
    const value = this.value(field);
    if (!hasSolutionAnswer(value)) return "Ответ не указан";
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    if (value && typeof value === "object" && "url" in value) return String(value.url);
    return String(value);
  }
  fileLink(field: SolutionField): string | null {
    const value = this.value(field);
    if (!value || typeof value !== "object" || !("url" in value) || typeof value.url !== "string")
      return null;
    try {
      const url = new URL(value.url);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }
  fileChanged(field: SolutionField, event: Event) {
    const input = event.target as HTMLInputElement,
      file = input.files?.[0];
    input.value = "";
    if (file && !this.busy() && !this.readonly() && !this.preview())
      this.upload.emit({ fieldId: field.id, file });
  }
  accept(field: SolutionField) {
    return field.validation.allowedExtensions.map(extension => "." + extension).join(",");
  }
}
