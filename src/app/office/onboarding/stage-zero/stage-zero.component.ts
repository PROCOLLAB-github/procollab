/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { ValidationService } from "@core/services";
import { concatMap, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { User } from "@auth/models/user.model";
import { OnboardingService } from "../services/onboarding.service";
import { ControlErrorPipe } from "@core/pipes/control-error.pipe";
import { ButtonComponent, InputComponent } from "@ui/components";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-stage-zero",
  templateUrl: "./stage-zero.component.html",
  styleUrl: "./stage-zero.component.scss",
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    AvatarControlComponent,
    InputComponent,
    ButtonComponent,
    ControlErrorPipe,
  ],
})
export class OnboardingStageZeroComponent implements OnInit, OnDestroy {
  constructor(
    public readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
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
    });

    const formValueState$ = this.onboardingService.formValue$.subscribe(fv => {
      this.stageForm.patchValue({
        avatar: fv.avatar,
        city: fv.city,
        organization: fv.organization,
      });
    });

    this.subscriptions$.push(profile$, formValueState$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  stageForm: FormGroup;
  errorMessage = ErrorMessage;
  profile?: User;
  stageSubmitting = false;
  subscriptions$: Subscription[] = [];

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.stageSubmitting = true;

    this.authService
      .saveProfile(this.stageForm.value)
      .pipe(concatMap(() => this.authService.setOnboardingStage(1)))
      .subscribe(() => {
        this.onboardingService.setFormValue(this.stageForm.value);
        this.router
          .navigateByUrl("/office/onboarding/stage-1")
          .then(() => console.debug("Route changed from OnboardingStageZeroComponent"));
      });
  }
}
