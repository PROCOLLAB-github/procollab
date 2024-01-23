/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ProjectStep } from "@models/project.model";
import { Industry } from "@models/industry.model";
import { IndustryService } from "@services/industry.service";
import { ProjectService } from "@services/project.service";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { NumSliderComponent } from "@ui/components/num-slider/num-slider.component";
import { CheckboxComponent } from "@ui/components";

@Component({
  selector: "app-projects-filter",
  templateUrl: "./projects-filter.component.html",
  styleUrl: "./projects-filter.component.scss",
  standalone: true,
  imports: [CheckboxComponent, NumSliderComponent, SwitchComponent],
})
export class ProjectsFilterComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly industryService: IndustryService,
    private readonly projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.industries$ = this.industryService.industries.subscribe(industries => {
      this.industries = industries;
    });

    this.steps$ = this.projectService.steps.subscribe(steps => {
      this.steps = steps;
    });

    this.queries$ = this.route.queryParams.subscribe(queries => {
      this.currentIndustry = parseInt(queries["industry"]);
      this.currentStep = parseInt(queries["step"]);
      this.currentMembersCount = parseInt(queries["membersCount"]);
      this.hasVacancies = queries["anyVacancies"] === "true";
    });
  }

  queries$?: Subscription;

  currentStep: number | null = null;
  steps: ProjectStep[] = [];
  steps$?: Subscription;

  currentIndustry: number | null = null;
  industries: Industry[] = [];
  industries$?: Subscription;

  hasVacancies = false;

  membersCountOptions = [1, 2, 3, 4, 5, 6];
  currentMembersCount: number | null = null;

  onFilterByStep(event: Event, stepId?: number): void {
    event.stopPropagation();

    this.router
      .navigate([], {
        queryParams: { step: stepId === this.currentStep ? undefined : stepId },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  onFilterByIndustry(event: Event, industryId?: number): void {
    event.stopPropagation();

    this.router
      .navigate([], {
        queryParams: { industry: industryId === this.currentIndustry ? undefined : industryId },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  onFilterByMembersCount(count?: number): void {
    this.router
      .navigate([], {
        queryParams: {
          membersCount: count === this.currentMembersCount ? undefined : count,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  onFilterVacancies(has: boolean): void {
    this.router
      .navigate([], {
        queryParams: {
          anyVacancies: has,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }
}
