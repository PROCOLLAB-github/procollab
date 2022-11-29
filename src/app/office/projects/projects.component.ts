/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable, Subscription } from "rxjs";
import { ProjectCount, ProjectStep } from "../models/project.model";
import { ProjectService } from "../services/project.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { IndustryService } from "../services/industry.service";
import { Industry } from "../models/industry.model";

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
    private fb: FormBuilder,
    private industryService: IndustryService
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
          queryParams: { search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from ProjectsComponent"));
    });

    this.industries$ = this.industryService.industries.subscribe(industries => {
      this.industries = industries;
    });

    this.steps$ = this.projectService.steps.subscribe(steps => {
      this.steps = steps;
    });

    this.queries$ = this.route.queryParams.subscribe(queries => {
      this.currentIndustry = parseInt(queries["industry"]);
      this.currentStep = parseInt(queries["step"]);
    });
  }

  ngOnDestroy(): void {
    [this.searchFormSearch$, this.industries$, this.queries$, this.steps$].forEach($ =>
      $?.unsubscribe()
    );
  }

  filterOpen = false;

  queries$?: Subscription;

  currentStep: number | null = null;
  steps: ProjectStep[] = [];
  steps$?: Subscription;

  currentIndustry: number | null = null;
  industries: Industry[] = [];
  industries$?: Subscription;

  searchForm: FormGroup;
  searchFormSearch$?: Subscription;

  projectsCount$: Observable<ProjectCount> = this.route.data.pipe(map(r => r["data"]));

  isMy: Observable<boolean> = this.route.url.pipe(map(() => location.href.includes("/my")));
  isAll: Observable<boolean> = this.route.url.pipe(map(() => location.href.includes("/all")));

  addProject(): void {
    this.projectService.create().subscribe(project => {
      this.router
        .navigateByUrl(`/office/projects/${project.id}/edit`)
        .then(() => console.debug("Route change from ProjectsComponent"));
    });
  }

  filterByStep(stepId?: number): void {
    this.router
      .navigate([], {
        queryParams: { step: stepId === this.currentStep ? undefined : stepId },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  filterByIndustry(industryId?: number): void {
    this.router
      .navigate([], {
        queryParams: { industry: industryId === this.currentIndustry ? undefined : industryId },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  onFilterOutside() {
    if (this.filterOpen && location.href.includes("/all")) {
      this.filterOpen = false;
    }
  }
}
