/** @format */

import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ButtonComponent } from "@ui/primitives";

/** Карточка вакансии в ленте: источник, роль, описание, навыки и переход к вакансии. */
@Component({
  selector: "app-open-vacancy",
  imports: [
    RouterLink,
    DayjsPipe,
    ParseLinksPipe,
    ParseBreaksPipe,
    AvatarComponent,
    ButtonComponent,
  ],
  templateUrl: "./open-vacancy.component.html",
  styleUrl: "./open-vacancy.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenVacancyComponent {
  readonly feedItem = input.required<Vacancy>();
  readonly publishedAt = input<string>("");

  protected readonly AppRoutes = AppRoutes;
  protected readonly industryRepository = inject(IndustryRepositoryPort);
}
