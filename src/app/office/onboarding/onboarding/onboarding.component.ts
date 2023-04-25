/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@auth/services";
import { noop, Subscription } from "rxjs";

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.authService.setOnboardingStage("хуйсусами").subscribe(noop);
    const profile = this.authService.profile.subscribe(p => {
      if (p.onboardingStage === null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnbaordingComponent"));
        return;
      }

      this.stage = p.onboardingStage;

      this.router
        .navigate([`stage-${p.onboardingStage}`], { relativeTo: this.route })
        .then(() => console.debug("Route changed from OnboardingComponent"));
    });
    this.subscriptions$.push(profile);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  stage = 0;

  subscriptions$: Subscription[] = [];
}
