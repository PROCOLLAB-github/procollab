/** @format */
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { ProgramFieldAnswer } from "@domain/project/program-link-fields.model";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-program-field-answers",
  templateUrl: "./program-field-answers.component.html",
  styleUrl: "./program-field-answers.component.scss",
  host: { "[hidden]": "!answers().length" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramFieldAnswersComponent {
  readonly fields = input.required<readonly ProgramFieldAnswer[]>();
  readonly includeProjectMaterials = input(false);
  protected readonly answers = computed(() =>
    this.fields().filter(
      field =>
        field.value?.trim() &&
        (this.includeProjectMaterials() ||
          (field.name !== "project_description" && field.name !== "project_presentation")),
    ),
  );
  protected readonly href = presentationHref;

  protected checkboxAnswer(value: string | null): string | null {
    switch (value?.toLowerCase()) {
      case "true":
        return "Да";
      case "false":
        return "Нет";
      default:
        return value;
    }
  }
}
