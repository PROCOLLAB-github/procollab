/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { concatMap, Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-stage-two",
  templateUrl: "./stage-two.component.html",
  styleUrls: ["./stage-two.component.scss"],
})
export class OnboardingStageTwoComponent implements OnInit, OnDestroy {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  userRole = -1;
  stageTouched = false;
  subscriptions$: Subscription[] = [];

  onSetRole(role: number) {
    this.userRole = role;
  }

  onSubmit() {
    if (this.userRole === -1) {
      this.stageTouched = true;
      return;
    }

    this.authService
      .saveProfile({ userType: this.userRole })
      .pipe(concatMap(() => this.authService.setOnboardingStage(null)))
      .subscribe(() => {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnboardingStageTwo"));
      });
  }
}
