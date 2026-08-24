/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IconComponent } from "@ui/primitives";
import { Project } from "@domain/project/project.model";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

/** Левая колонка детали проекта. */
@Component({
  selector: "app-projects-left-side",
  templateUrl: "./projects-left-side.component.html",
  styleUrl: "./projects-left-side.component.scss",
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsLeftSideComponent {
  readonly project = input.required<Project | undefined>();

  protected readonly industryRepository = inject(IndustryRepositoryPort);
  protected readonly AppRoutes = AppRoutes;

  protected displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === "") {
      return "Не указан";
    }

    return String(value);
  }

  protected displayTrl(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === "" || value === 0 || value === "0"
      ? "Не указан"
      : String(value);
  }

  protected leaderName(project: Project): string {
    const firstName = project.leaderInfo?.firstName;
    const lastName = project.leaderInfo?.lastName;

    return [lastName, firstName].filter(Boolean).join(" ") || "Не указан";
  }
}
