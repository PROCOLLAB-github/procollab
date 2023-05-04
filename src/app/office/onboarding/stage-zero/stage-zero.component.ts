/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { ValidationService } from "@core/services";
import { concatMap, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-stage-zero",
  templateUrl: "./stage-zero.component.html",
  styleUrls: ["./stage-zero.component.scss"],
})
export class OnboardingStageZeroComponent implements OnInit, OnDestroy {
  constructor(
    public readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly router: Router
  ) {
    this.stageForm = this.fb.group({
      avatar: ["", [Validators.required]],
      city: ["", [Validators.required]],
      organization: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    const profile$ = this.authService.profile.subscribe(p => {
      this.profile = p;

      this.stageForm.patchValue({
        avatar: p.avatar,
        city: p.city,
        organization: p.organization,
      });
    });
    this.subscriptions$.push(profile$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  stageForm: FormGroup;
  errorMessage = ErrorMessage;
  profile?: User;
  subscriptions$: Subscription[] = [];

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.authService
      .saveProfile(this.stageForm.value)
      .pipe(concatMap(() => this.authService.setOnboardingStage(1)))
      .subscribe(() => {
        this.router
          .navigateByUrl("/office/onboarding/stage-1")
          .then(() => console.debug("Route changed from OnboardingStageZeroComponent"));
      });
  }
}
