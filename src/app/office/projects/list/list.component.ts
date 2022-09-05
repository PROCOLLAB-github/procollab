/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { pluck, Subscription } from "rxjs";
import { AuthService } from "../../../auth/services";
import { Project } from "../../models/project.model";
import { User } from "../../../auth/models/user.model";
import { NavService } from "../../services/nav.service";
import { ProjectService } from "../../services/project.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navService: NavService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");

    this.profile$ = this.authService.profile.subscribe(profile => {
      this.profile = profile;
    });

    this.projects$ = this.route.data.pipe(pluck("data")).subscribe(projects => {
      this.projects = projects;
    });
  }

  ngOnDestroy(): void {
    [this.profile$, this.projects$].forEach($ => $?.unsubscribe());
  }

  profile?: User;
  profile$?: Subscription;

  projects: Project[] = [];
  projects$?: Subscription;

  deleteProject(projectId: number): void {
    if (!confirm("Вы точно хотите удалить проект?")) {
      return;
    }

    this.projectService.remove(projectId).subscribe(() => {
      const index = this.projects.findIndex(project => project.id === projectId);
      this.projects.splice(index, 1);
    });
  }
}
