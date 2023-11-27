/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, take } from "rxjs";
import { OnboardingService } from "../services/onboarding.service";

@Component({
  selector: "app-onboarding",
  templateUrl: "./onboarding.component.html",
  styleUrl: "./onboarding.component.scss",
})
export class OnboardingComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const stage$ = this.onboardingService.currentStage$.subscribe(s => {
      if (s === null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnboardingComponent"));
        return;
      }

      if (this.router.url.includes("stage")) {
        this.stage = parseInt(this.router.url.split("-")[1]);
      } else {
        this.stage = s;
      }

      this.router
        .navigate([`stage-${this.stage}`], { relativeTo: this.route })
        .then(() => console.debug("Route changed from OnboardingComponent"));
    });

    this.updateStage();
    const events$ = this.router.events.subscribe(this.updateStage.bind(this));

    this.subscriptions$.push(stage$, events$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  stage = 0;
  activeStage = 0;

  subscriptions$: Subscription[] = [];

  updateStage(): void {
    this.activeStage = parseInt(this.router.url.split("-")[1]);
    this.stage = parseInt(this.router.url.split("-")[1]);
  }

  goToStep(stage: number): void {
    if (this.stage < stage) return;

    this.router
      .navigate([`stage-${stage}`], { relativeTo: this.route })
      .then(() => console.debug("Route changed from OnboardingComponent"));
  }
}
