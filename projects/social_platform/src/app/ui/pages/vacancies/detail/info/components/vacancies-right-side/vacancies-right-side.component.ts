/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { ButtonComponent } from "@ui/primitives";
import { UserLinksPipe, CapitalizePipe, SalaryTransformPipe } from "@corelib";
import { RouterModule } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { AppRoutes } from "@api/paths/app-routes";
import { VacancyStatusComponent } from "@ui/widgets/vacancy-status/vacancy-status.component";

/** Правая колонка детали вакансии. */
@Component({
  selector: "app-vacancies-right-side",
  templateUrl: "./vacancies-right-side.component.html",
  styleUrl: "./vacancies-right-side.component.scss",
  imports: [
    VacancyStatusComponent,
    ButtonComponent,
    RouterModule,
    UserLinksPipe,
    CapitalizePipe,
    SalaryTransformPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesRightSideComponent {
  protected readonly AppRoutes = AppRoutes;

  readonly vacancy = input.required<Vacancy | undefined>();
  readonly sendResponse = output<void>();
  readonly manageResponses = output<void>();

  protected responseStatusLabel(status: Vacancy["responseStatus"] | undefined): string {
    switch (status) {
      case "pending":
        return "На рассмотрении";
      case "accepted":
        return "Отклик принят";
      case "rejected":
        return "Отклик отклонён";
      default:
        return "Отклик отправлен";
    }
  }

  onSendResponseClick(): void {
    this.sendResponse.emit();
  }

  onManageResponsesClick(): void {
    this.manageResponses.emit();
  }
}
