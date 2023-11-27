/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { concatMap, Subscription, take } from "rxjs";
import { Router } from "@angular/router";
import { OnboardingService } from "../services/onboarding.service";
import { NgIf } from "@angular/common";
import { ButtonComponent } from "../../../ui/components/button/button.component";
import { UserTypeCardComponent } from "../user-type-card/user-type-card.component";

@Component({
    selector: "app-stage-two",
    templateUrl: "./stage-two.component.html",
    styleUrl: "./stage-two.component.scss",
    standalone: true,
    imports: [
        UserTypeCardComponent,
        ButtonComponent,
        NgIf,
    ],
})
export class OnboardingStageTwoComponent implements OnInit, OnDestroy {
  constructor(
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const formValue$ = this.onboardingService.formValue$.pipe(take(1)).subscribe(fv => {
      this.userRole = fv.userType ? fv.userType : -1;
    });

    this.subscriptions$.push(formValue$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  userRole!: number;
  stageTouched = false;
  stageSubmitting = false;
  subscriptions$: Subscription[] = [];

  onSetRole(role: number) {
    this.userRole = role;
    this.onboardingService.setFormValue({ userType: role });
  }

  onSubmit() {
    if (this.userRole === -1) {
      this.stageTouched = true;
      return;
    }

    this.stageSubmitting = true;

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
