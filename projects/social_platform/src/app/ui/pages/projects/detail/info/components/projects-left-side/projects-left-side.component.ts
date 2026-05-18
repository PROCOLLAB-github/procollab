/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input, WritableSignal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IconComponent } from "@ui/primitives";
import { TruncatePipe } from "@corelib";
import { Project } from "@domain/project/project.model";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepository } from "@infrastructure/repository/industry/industry.repository";

@Component({
  selector: "app-projects-left-side",
  templateUrl: "./projects-left-side.component.html",
  styleUrl: "./projects-left-side.component.scss",
  imports: [CommonModule, RouterModule, IconComponent, TruncatePipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsLeftSideComponent {
  @Input() project!: WritableSignal<Project | undefined>;

  protected readonly industryRepository = inject(IndustryRepository);
  protected readonly AppRoutes = AppRoutes;
}
