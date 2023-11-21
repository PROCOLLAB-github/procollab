/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { map, Subscription } from "rxjs";
import { ProjectCount } from "@models/project.model";
import { ProjectService } from "@services/project.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { AuthService } from "@auth/services";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
    public readonly projectService: ProjectService,
    private readonly router: Router,
    private readonly fb: UntypedFormBuilder,
    private readonly authService: AuthService
  ) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");

    const searchFormSearch$ = this.searchForm.get("search")?.valueChanges.subscribe(search => {
      this.router
        .navigate([], {
          queryParams: { search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from ProjectsComponent"));
    });

    searchFormSearch$ && this.subscriptions$.push(searchFormSearch$);

    const routeData$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((count: ProjectCount) => {
        this.projectService.projectsCount.next(count);
      });

    routeData$ && this.subscriptions$.push(routeData$);

    const routeUrl$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMy = location.href.includes("/my");
        this.isAll = location.href.includes("/all");
        this.isSubs = location.href.includes("/subscriptions");
      }
    });
    routeUrl$ && this.subscriptions$.push(routeUrl$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  searchForm: UntypedFormGroup;
  subscriptions$: Subscription[] = [];

  isMy = location.href.includes("/my");
  isAll = location.href.includes("/all");
  isSubs = location.href.includes("/subscriptions");

  subsCount$ = this.authService.profile.pipe(map(p => p.subscribedProjects.length));

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
