/** @format */

import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { VacancyResponsesLoadError } from "@api/vacancy/vacancy-response-error";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ButtonComponent } from "@ui/primitives";

@Component({
  selector: "app-vacancy-responses",
  templateUrl: "./vacancy-responses.component.html",
  styleUrl: "./vacancy-responses.component.scss",
  imports: [AvatarComponent, ButtonComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyResponsesComponent {
  readonly responses = input<VacancyResponse[]>([]);
  readonly loading = input(false);
  readonly error = input<VacancyResponsesLoadError | null>(null);
  readonly processingResponseIds = input<number[]>([]);

  readonly retry = output<void>();
  readonly accept = output<number>();
  readonly decline = output<number>();

  protected isProcessing(responseId: number): boolean {
    return this.processingResponseIds().includes(responseId);
  }

  protected errorMessage(error: VacancyResponsesLoadError): string {
    if (error === "forbidden") return "У вас нет доступа к откликам этой вакансии";
    if (error === "not_found") return "Вакансия не найдена";
    return "Не удалось загрузить отклики";
  }
}
