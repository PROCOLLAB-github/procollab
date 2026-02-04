/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, WritableSignal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IconComponent } from "@ui/components";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { IndustryService } from "projects/social_platform/src/app/api/industry/industry.service";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

@Component({
  selector: "app-projects-left-side",
  templateUrl: "./projects-left-side.component.html",
  styleUrl: "./projects-left-side.component.scss",
  imports: [CommonModule, RouterModule, IconComponent, TruncatePipe],
  standalone: true,
})
export class ProjectsLeftSideComponent {
  @Input() project!: WritableSignal<Project | undefined>;

  protected readonly industryService = inject(IndustryService);
}
