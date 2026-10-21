/** @format */

import { CardDirective } from "@uilib";
/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { IconComponent, ButtonComponent } from "@ui/primitives";
import { VacancyStatusComponent } from "../vacancy-status/vacancy-status.component";
import { VacancySkillsComponent } from "../vacancy-skills/vacancy-skills.component";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";

@Component({
  selector: "app-vacancy-card",
  templateUrl: "./vacancy-card.component.html",
  styleUrl: "./vacancy-card.component.scss",
  imports: [
    CardDirective,
    IconComponent,
    ButtonComponent,
    VacancyStatusComponent,
    VacancySkillsComponent,
    DatePipe,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyCardComponent {
  readonly vacancy = input<Vacancy | undefined>();
  readonly disabled = input(false);
  readonly manageLifecycle = input(false);
  readonly changeStatus = output<number>();
  protected readonly AppRoutes = AppRoutes;
  readonly remove = output<number>();
  readonly edit = output<number>();

  onChangeStatus(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.disabled() && this.vacancy()) this.changeStatus.emit(this.vacancy()!.id);
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.disabled() && this.vacancy()) this.remove.emit(this.vacancy()!.id);
  }
  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.disabled() && this.vacancy()) this.edit.emit(this.vacancy()!.id);
  }
}
