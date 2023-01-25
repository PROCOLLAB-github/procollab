/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { map, Subscription } from "rxjs";
import { ProjectCount } from "../models/project.model";
import { ProjectService } from "../services/project.service";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  constructor(
    private navService: NavService,
    private route: ActivatedRoute,
    public projectService: ProjectService,
    private router: Router,
    private fb: FormBuilder
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
      }
    });
    routeUrl$ && this.subscriptions$.push(routeUrl$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  searchForm: FormGroup;
  subscriptions$: Subscription[] = [];

  isMy = location.href.includes("/my");

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
