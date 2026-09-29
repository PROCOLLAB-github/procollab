/** @format */

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { VacancyStatusComponent } from "@ui/widgets/vacancy-status/vacancy-status.component";
import { VacancyLetterComponent } from "@ui/widgets/vacancy-letter/vacancy-letter.component";
@Component({
  selector: "app-response-card",
  templateUrl: "./response-card.component.html",
  styleUrl: "./response-card.component.scss",
  imports: [DatePipe, RouterLink, VacancyStatusComponent, VacancyLetterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseCardComponent {
  readonly response = input.required<VacancyResponse>();
  readonly vacancyDetails = computed(() => {
    const vacancy = this.response().vacancy;
    return typeof vacancy === "number" ? null : vacancy;
  });
  readonly vacancyId = computed(
    () => this.vacancyDetails()?.id ?? (this.response().vacancy as number),
  );
  readonly status = computed(() => {
    const isApproved = this.response().isApproved;
    if (isApproved === true) return { label: "Принят", tone: "success" as const };
    if (isApproved === false) return { label: "Отклонён", tone: "declined" as const };
    return { label: "На рассмотрении", tone: "pending" as const };
  });
  protected readonly AppRoutes = AppRoutes;
}
