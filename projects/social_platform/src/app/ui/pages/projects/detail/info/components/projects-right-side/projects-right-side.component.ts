/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input, WritableSignal } from "@angular/core";
import { IconComponent } from "@uilib";
import { TruncatePipe, UserLinksPipe } from "@corelib";
import { ExpandService } from "@api/expand/expand.service";
import { Project } from "@domain/project/project.model";

@Component({
  selector: "app-projects-right-side",
  templateUrl: "./projects-right-side.component.html",
  styleUrl: "./projects-right-side.component.scss",
  imports: [CommonModule, IconComponent, UserLinksPipe, TruncatePipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsRightSideComponent {
  @Input() project!: WritableSignal<Project | undefined>;

  protected readonly expandService = inject(ExpandService);

  protected readonly readAllAchievements = this.expandService.readAll()["achievements"]; // Флаг показа всех достижений
}
