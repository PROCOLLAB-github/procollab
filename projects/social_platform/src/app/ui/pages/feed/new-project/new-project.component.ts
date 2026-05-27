/** @format */

import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { TruncatePipe, DayjsPipe } from "@corelib";
import { FeedProject } from "@domain/feed/feed-item.model";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

/** Карточка нового проекта в ленте новостей. */
@Component({
  selector: "app-new-project",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    AvatarComponent,
    RouterLink,
    DayjsPipe,
    TruncatePipe,
    IconComponent,
    TagComponent,
  ],
  templateUrl: "./new-project.component.html",
  styleUrl: "./new-project.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectComponent {
  @Input() feedItem!: FeedProject;

  protected readonly AppRoutes = AppRoutes;

  constructor(public readonly industryRepository: IndustryRepositoryPort) {}
}
