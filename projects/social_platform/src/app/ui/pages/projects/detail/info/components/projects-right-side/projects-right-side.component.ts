/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, WritableSignal } from "@angular/core";
import { IconComponent } from "@uilib";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "projects/core/src/lib/pipes/user/user-links.pipe";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

@Component({
  selector: "app-projects-right-side",
  templateUrl: "./projects-right-side.component.html",
  styleUrl: "./projects-right-side.component.scss",
  imports: [CommonModule, IconComponent, UserLinksPipe, TruncatePipe],
  standalone: true,
})
export class ProjectsRightSideComponent {
  @Input() project!: WritableSignal<Project | undefined>;

  private readonly expandService = inject(ExpandService);

  protected readonly readAllAchievements = this.expandService.readAllAchievements; // Флаг показа всех достижений
}
