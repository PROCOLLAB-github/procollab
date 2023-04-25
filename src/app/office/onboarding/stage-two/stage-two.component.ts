/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { concatMap, Subscription } from "rxjs";

@Component({
  selector: "app-stage-two",
  templateUrl: "./stage-two.component.html",
  styleUrls: ["./stage-two.component.scss"],
})
export class OnboardingStageTwoComponent implements OnInit, OnDestroy {
  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  userRole = -1;

  subscriptions$: Subscription[] = [];

  setUserRole(role: number) {
    this.userRole = role;
  }

  onSubmit() {
    if (this.userRole === -1) return;

    this.authService
      .saveProfile({ userType: this.userRole })
      .pipe(concatMap(() => this.authService.setOnboardingStage(null)))
      .subscribe(() => {});
  }
}
