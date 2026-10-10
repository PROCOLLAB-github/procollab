/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../ui/src/lib/services/desktop-layout.service";

import { CardDirective } from "@uilib";

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { ButtonComponent } from "@ui/primitives";
import { DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { AppRoutes } from "@api/paths/app-routes";
import { VacancyStatusComponent } from "../vacancy-status/vacancy-status.component";
import { VacancySkillsComponent } from "../vacancy-skills/vacancy-skills.component";
@Component({
  selector: "app-project-vacancy-card",
  imports: [
    CardDirective,
    RouterLink,
    ButtonComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    AvatarComponent,
    DayjsPipe,
    VacancyStatusComponent,
    VacancySkillsComponent,
  ],
  templateUrl: "./project-vacancy-card.component.html",
  styleUrl: "./project-vacancy-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectVacancyCardComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  protected readonly AppRoutes = AppRoutes;
  readonly vacancy = input.required<Vacancy>();
  readonly type = input<"vacancies" | "project">("project");
}
