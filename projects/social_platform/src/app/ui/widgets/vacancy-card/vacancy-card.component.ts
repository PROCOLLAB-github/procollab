/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../ui/src/lib/services/desktop-layout.service";

import { CardDirective } from "@uilib";

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { IconComponent, ButtonComponent } from "@ui/primitives";
import { VacancyStatusComponent } from "../vacancy-status/vacancy-status.component";
import { VacancySkillsComponent } from "../vacancy-skills/vacancy-skills.component";

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyCardComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  readonly vacancy = input<Vacancy | undefined>();
  readonly disabled = input(false);
  readonly remove = output<number>();
  readonly edit = output<number>();

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
