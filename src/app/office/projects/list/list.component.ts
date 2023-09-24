/** @format */

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { concatMap, distinctUntilChanged, map, of, Subscription } from "rxjs";
import { AuthService } from "@auth/services";
import { Project } from "@models/project.model";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { ProjectService } from "@services/project.service";
import Fuse from "fuse.js";
import { HttpParams } from "@angular/common/http";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly navService: NavService,
    private readonly projectService: ProjectService,
    private readonly cdref: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");

    const routeUrl$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMy = location.href.includes("/my");
        this.isAll = location.href.includes("/all");
      }
    });
    routeUrl$ && this.subscriptions$.push(routeUrl$);

    const profile$ = this.authService.profile.subscribe(profile => {
      this.profile = profile;
    });

    profile$ && this.subscriptions$.push(profile$);

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const fuse = new Fuse(this.projects, {
        keys: ["name"],
      });

      this.searchedProjects = search ? fuse.search(search).map(el => el.item) : this.projects;
    });

    querySearch$ && this.subscriptions$.push(querySearch$);

    if (location.href.includes("/all")) {
      const observable = this.route.queryParams.pipe(
        distinctUntilChanged(),
        concatMap(q => {
          const reqQuery: Record<string, any> = {};

          if (q["industry"]) {
            reqQuery["industry"] = q["industry"];
          }
          if (q["step"]) {
            reqQuery["step"] = q["step"];
          }
          if (q["membersCount"]) {
            reqQuery["collaborator__count__gte"] = q["membersCount"];
          }
          if (q["anyVacancies"]) {
            reqQuery["any_vacancies"] = q["anyVacancies"];
          }

          if (JSON.stringify(reqQuery) !== JSON.stringify(this.previousReqQuery)) {
            try {
              this.previousReqQuery = reqQuery;
              return this.projectService.getAll(new HttpParams({ fromObject: reqQuery }));
            } catch (e) {
              console.error(e);
              this.previousReqQuery = reqQuery;
              return this.projectService.getAll();
            }
          }

          this.previousReqQuery = reqQuery;

          return of(0);
        })
      );

      const queryIndustry$ = observable.subscribe(projects => {
        if (typeof projects === "number") return;

        this.projects = projects;
        this.searchedProjects = projects;

        this.cdref.detectChanges();
      });

      queryIndustry$ && this.subscriptions$.push(queryIndustry$);
    }

    const projects$ = this.route.data.pipe(map(r => r["data"])).subscribe(projects => {
      this.projects = projects ?? [];
      this.searchedProjects = projects ?? [];
    });

    projects$ && this.subscriptions$.push(projects$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  isFilterOpen = false;

  isAll = location.href.includes("/all");
  isMy = location.href.includes("/my");

  profile?: User;
  subscriptions$: Subscription[] = [];

  projects: Project[] = [];
  searchedProjects: Project[] = [];

  private previousReqQuery: Record<string, any> = {};

  deleteProject(projectId: number): void {
    if (!confirm("Вы точно хотите удалить проект?")) {
      return;
    }

    this.projectService.remove(projectId).subscribe(() => {
      this.projectService.projectsCount.next({
        ...this.projectService.projectsCount.getValue(),
        my: this.projectService.projectsCount.getValue().my - 1,
      });

      const index = this.projects.findIndex(project => project.id === projectId);
      this.projects.splice(index, 1);
    });
  }

  addProject(): void {
    this.projectService.create().subscribe(project => {
      this.projectService.projectsCount.next({
        ...this.projectService.projectsCount.getValue(),
        my: this.projectService.projectsCount.getValue().my + 1,
      });

      this.router
        .navigateByUrl(`/office/projects/${project.id}/edit`)
        .then(() => console.debug("Route change from ProjectsComponent"));
    });
  }
}
