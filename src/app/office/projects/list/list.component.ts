/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, map, Subscription } from "rxjs";
import { AuthService } from "../../../auth/services";
import { Project } from "../../models/project.model";
import { User } from "../../../auth/models/user.model";
import { NavService } from "../../services/nav.service";
import { ProjectService } from "../../services/project.service";
import Fuse from "fuse.js";
import { HttpParams } from "@angular/common/http";

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

    this.querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const fuse = new Fuse(this.projects, {
        keys: ["name"],
      });

      this.searchedProjects = search ? fuse.search(search).map(el => el.item) : this.projects;
    });

    if (location.href.includes("/all")) {
      this.queryIndustry$ = this.route.queryParams
        .pipe(
          map(q => q["industry"]),
          concatMap(industry =>
            this.projectService.getAll(
              industry ? new HttpParams({ fromObject: { industry } }) : undefined
            )
          )
        )
        .subscribe(projects => {
          this.projects = projects;
          this.searchedProjects = projects;
        });

      this.projects$ = this.route.data.pipe(map(r => r["data"])).subscribe(projects => {
        this.projects = projects;
        this.searchedProjects = projects;
      });
    }
  }

  ngOnDestroy(): void {
    [this.profile$, this.projects$, this.querySearch$, this.queryIndustry$].forEach($ =>
      $?.unsubscribe()
    );
  }

  profile?: User;
  profile$?: Subscription;

  queryIndustry$?: Subscription;

  querySearch$?: Subscription;

  projects: Project[] = [];
  searchedProjects: Project[] = [];
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
