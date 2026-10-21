/** @format */
import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import { AlertDirective, AvatarComponent } from "@uilib";
import { ManagementCriterion } from "@domain/program/program-criteria.model";
import { ResultExpert, ResultProject } from "@domain/program/program-results.model";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-result-project-scores",
  imports: [AlertDirective, AvatarComponent],
  templateUrl: "./result-project-scores.component.html",
  styleUrl: "./result-project-scores.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultProjectScoresComponent {
  readonly project = input.required<ResultProject>();
  readonly criteria = input.required<ManagementCriterion[]>();
  readonly expandedExperts = model(new Set<string>());
  readonly href = presentationHref;
  readonly matrixCriteria = computed(() => this.criteria().filter(c => c.type !== "str"));
  readonly comments = computed(() => this.criteria().filter(c => c.type === "str"));
  readonly format = (value: number | null | undefined): string =>
    value == null
      ? "—"
      : value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  initials(expert: ResultExpert): string {
    return expert.name
      .split(/\s+/)
      .slice(0, 2)
      .map(v => v[0])
      .join("");
  }
  value(expert: ResultExpert, criterion: ManagementCriterion): string {
    const value = expert.values.find(v => v.criterionId === criterion.id)?.value;
    return value === "True" && criterion.type === "bool"
      ? "Да"
      : value === "False" && criterion.type === "bool"
        ? "Нет"
        : value == null || value === ""
          ? "—"
          : value;
  }
  toggleExpert(key: string): void {
    this.expandedExperts.update(ids => {
      const next = new Set(ids);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
}
