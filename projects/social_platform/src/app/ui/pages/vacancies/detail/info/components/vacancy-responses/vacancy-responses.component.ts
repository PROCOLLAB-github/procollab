/** @format */

import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { VacancyResponsesLoadError } from "@api/vacancy/vacancy-response-error";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { VacancyStatusComponent } from "@ui/widgets/vacancy-status/vacancy-status.component";
import { VacancySkillsComponent } from "@ui/widgets/vacancy-skills/vacancy-skills.component";
import { VacancyLetterComponent } from "@ui/widgets/vacancy-letter/vacancy-letter.component";
@Component({
  selector: "app-vacancy-responses",
  templateUrl: "./vacancy-responses.component.html",
  styleUrl: "./vacancy-responses.component.scss",
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    DatePipe,
    VacancyStatusComponent,
    VacancySkillsComponent,
    VacancyLetterComponent,
  ],
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
  readonly close = output<void>();
  protected decide(responseId: number, accepted: boolean, header: HTMLElement): void {
    // The decision removes its buttons; keep keyboard focus inside the dialog.
    header.focus();
    if (accepted) this.accept.emit(responseId);
    else this.decline.emit(responseId);
  }
  protected isProcessing(responseId: number): boolean {
    return this.processingResponseIds().includes(responseId);
  }
  protected errorMessage(error: VacancyResponsesLoadError): string {
    if (error === "forbidden") return "У вас нет доступа к откликам этой вакансии";
    if (error === "not_found") return "Вакансия не найдена";
    return "Не удалось загрузить отклики";
  }
}
