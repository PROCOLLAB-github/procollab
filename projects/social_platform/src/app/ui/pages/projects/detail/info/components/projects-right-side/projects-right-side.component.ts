/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  Input,
  WritableSignal,
} from "@angular/core";
import { IconComponent } from "@uilib";
import { TruncatePipe, UserLinksPipe } from "@corelib";
import { ExpandService } from "@api/expand/expand.service";
import { Project } from "@domain/project/project.model";

/** Правая колонка детали проекта: команда, вакансии. */
@Component({
  selector: "app-projects-right-side",
  templateUrl: "./projects-right-side.component.html",
  styleUrl: "./projects-right-side.component.scss",
  imports: [CommonModule, IconComponent, UserLinksPipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsRightSideComponent {
  readonly project = input.required<Project | undefined>();

  protected readonly expandService = inject(ExpandService);

  protected readonly readAllAchievements = this.expandService.readAll()["achievements"]; // Флаг показа всех достижений
}
