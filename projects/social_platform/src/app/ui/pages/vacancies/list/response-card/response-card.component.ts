/** @format */

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { IconComponent } from "@uilib";
import { DatePipe } from "@angular/common";

/** Карточка отклика на вакансию с информацией о кандидате и действиями. */
@Component({
  selector: "app-response-card",
  templateUrl: "./response-card.component.html",
  styleUrl: "./response-card.component.scss",
  imports: [IconComponent, FileItemComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseCardComponent {
  readonly response = input.required<VacancyResponse>();
  readonly vacancyDetails = computed(() => {
    const vacancy = this.response().vacancy;
    return typeof vacancy === "number" ? null : vacancy;
  });
  readonly status = computed(() => {
    const isApproved = this.response().isApproved;
    if (isApproved === true) return { label: "Принят", className: "accepted" };
    if (isApproved === false) return { label: "Отклонён", className: "declined" };
    return { label: "На рассмотрении", className: "pending" };
  });
}
