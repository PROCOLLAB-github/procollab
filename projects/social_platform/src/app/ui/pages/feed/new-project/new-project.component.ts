/** @format */

import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DayjsPipe } from "@corelib";
import { FeedProject } from "@domain/feed/feed-item.model";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";

/** Карточка нового проекта в общей ленте. */
@Component({
  selector: "app-new-project",
  imports: [RouterLink, DayjsPipe, AvatarComponent],
  templateUrl: "./new-project.component.html",
  styleUrl: "./new-project.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectComponent {
  readonly feedItem = input.required<FeedProject>();
  readonly publishedAt = input<string>("");

  protected readonly AppRoutes = AppRoutes;
  protected readonly industryRepository = inject(IndustryRepositoryPort);
}
