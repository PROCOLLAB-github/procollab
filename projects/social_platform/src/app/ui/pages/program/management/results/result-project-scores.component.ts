/** @format */
import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import { AvatarComponent, IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";
import { ManagementCriterion } from "@domain/program/program-criteria.model";
import { ResultExpert, ResultEntry } from "@domain/program/program-results.model";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-result-project-scores",
  imports: [AvatarComponent, IconComponent, RouterLink],
  templateUrl: "./result-project-scores.component.html",
  styleUrl: "./result-project-scores.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultProjectScoresComponent {
  readonly project = input.required<ResultEntry>();
  readonly solution = computed(() => {
    const item = this.project();
    return "application" in item ? item.application : null;
  });
  readonly detailLink = computed(() => {
    const item = this.project();
    return "application" in item
      ? AppRoutes.program.solution(item.application.programId, item.application.solutionId)
      : AppRoutes.projects.detail(item.projectId);
  });
  readonly criteria = input.required<ManagementCriterion[]>();
  readonly expandedExperts = model(new Set<string>());
  readonly href = presentationHref;
  readonly paths = AppRoutes;
  readonly hasNumeric = computed(() =>
    this.criteria().some(c => c.type === "int" || c.type === "float"),
  );
  readonly matrixCriteria = computed(() => this.criteria().filter(c => c.type !== "str"));
  readonly comments = computed(() =>
    this.criteria().filter(c => c.type === "str" && this.commentExperts(c).length),
  );
  commentExperts(criterion: ManagementCriterion): ResultExpert[] {
    return this.project().experts.filter(
      expert => !!expert.values.find(v => v.criterionId === criterion.id)?.value?.trim(),
    );
  }
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
