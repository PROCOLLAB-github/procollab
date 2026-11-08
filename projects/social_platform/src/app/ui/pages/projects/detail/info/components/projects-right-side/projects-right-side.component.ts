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
import { ButtonDirective, IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { signal, computed } from "@angular/core";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProjectEntryComponent } from "@ui/widgets/project-entry/project-entry.component";
import { TruncatePipe, UserLinksPipe } from "@corelib";
import { ExpandService } from "@api/expand/expand.service";
import { Project } from "@domain/project/project.model";

/** Правая колонка детали проекта: команда, вакансии. */
@Component({
  selector: "app-projects-right-side",
  templateUrl: "./projects-right-side.component.html",
  styleUrl: "./projects-right-side.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    UserLinksPipe,
    TruncatePipe,
    RouterLink,
    ButtonDirective,
    ProjectEntryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsRightSideComponent {
  readonly project = input.required<Project | undefined>();
  readonly paths = AppRoutes;
  readonly entryOpen = signal(false);
  private readonly profile = inject(ProfileInfoService).profile;
  readonly leader = computed(
    () => !!this.profile() && this.profile()?.id === this.project()?.leader,
  );

  protected readonly expandService = inject(ExpandService);

  protected readonly readAllAchievements = this.expandService.readAll()["achievements"]; // Флаг показа всех достижений
}
