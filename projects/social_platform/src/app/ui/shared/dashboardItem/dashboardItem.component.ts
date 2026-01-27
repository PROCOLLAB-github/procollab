/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { Project } from "../../../domain/project/project.model";
import { ProjectsService } from "../../../api/project/projects.service";

@Component({
  selector: "app-dashboard-item",
  templateUrl: "./dashboardItem.component.html",
  styleUrl: "./dashboardItem.component.scss",
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink, InfoCardComponent],
})
export class DashboardItemComponent implements OnInit {
  @Input() title!: string;
  @Input() arrayItems!: Project[];
  @Input() iconName!: string;
  @Input() sectionName!: string;
  @Input() profileProjSubsIds?: number[];

  appereance: "base" | "subs" | "my" = "base";

  private readonly projectsService = inject(ProjectsService);

  ngOnInit(): void {
    switch (this.iconName) {
      case "favourities":
        this.appereance = "subs";

        break;

      case "main":
        this.appereance = "my";
        break;

      default:
        break;
    }
  }

  addProject(): void {
    this.projectsService.addProject();
  }
}
