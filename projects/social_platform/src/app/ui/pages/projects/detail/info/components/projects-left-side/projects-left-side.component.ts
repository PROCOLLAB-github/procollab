/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IconComponent } from "@ui/primitives";
import { TruncatePipe } from "@corelib";
import { Project } from "@domain/project/project.model";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

/** Левая колонка детали проекта. */
@Component({
  selector: "app-projects-left-side",
  templateUrl: "./projects-left-side.component.html",
  styleUrl: "./projects-left-side.component.scss",
  imports: [CommonModule, RouterModule, IconComponent, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsLeftSideComponent {
  readonly project = input.required<Project | undefined>();

  protected readonly industryRepository = inject(IndustryRepositoryPort);
  protected readonly AppRoutes = AppRoutes;
}
