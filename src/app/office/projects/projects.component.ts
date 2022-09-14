/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable, pluck, Subscription } from "rxjs";
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
    private projectService: ProjectService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");

    this.searchFormSearch$ = this.searchForm.get("search")?.valueChanges.subscribe(search => {
      this.router
        .navigate([], {
          queryParams: { query: search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from ProjectsComponent"));
    });
  }

  ngOnDestroy(): void {
    this.searchFormSearch$?.unsubscribe();
  }

  searchForm: FormGroup;
  searchFormSearch$?: Subscription;

  projectsCount$: Observable<ProjectCount> = this.route.data.pipe(pluck("data"));

  isMy: Observable<boolean> = this.route.url.pipe(map(() => location.href.includes("/my")));

  addProject(): void {
    this.projectService.create().subscribe(project => {
      this.router
        .navigateByUrl(`/office/projects/${project.id}/edit`)
        .then(() => console.debug("Route change from projects.component"));
    });
  }
}
