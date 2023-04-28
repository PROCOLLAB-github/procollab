/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@auth/services";
import { Subscription } from "rxjs";

@Component({
  selector: "app-onboarding",
  templateUrl: "./onboarding.component.html",
  styleUrls: ["./onboarding.component.scss"],
})
export class OnboardingComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const profile = this.authService.profile.subscribe(p => {
      if (p.onboardingStage === null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnboardingComponent"));
        return;
      }

      this.stage = p.onboardingStage;

      this.router
        .navigate([`stage-${p.onboardingStage}`], { relativeTo: this.route })
        .then(() => console.debug("Route changed from OnboardingComponent"));
    });
    this.subscriptions$.push(profile);

    this.updateActiveStage();
    const events$ = this.router.events.subscribe(this.updateActiveStage.bind(this));
    this.subscriptions$.push(events$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  stage = 0;
  activeStage = 0;

  subscriptions$: Subscription[] = [];

  updateActiveStage(): void {
    this.activeStage = parseInt(this.router.url.split("-")[1]);
  }

  goToStep(stage: number): void {
    if (this.stage < stage) return;

    this.router
      .navigate([`stage-${stage}`], { relativeTo: this.route })
      .then(() => console.debug("Route changed from OnboardingComponent"));
  }
}
