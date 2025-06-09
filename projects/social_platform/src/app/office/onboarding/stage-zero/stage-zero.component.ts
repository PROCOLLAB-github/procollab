/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { concatMap, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { User } from "@auth/models/user.model";
import { OnboardingService } from "../services/onboarding.service";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/components";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { CommonModule } from "@angular/common";
import { yearList } from "projects/core/src/consts/list-years";
import { educationUserLevel, educationUserType } from "projects/core/src/consts/list-education";

@Component({
  selector: "app-stage-zero",
  templateUrl: "./stage-zero.component.html",
  styleUrl: "./stage-zero.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AvatarControlComponent,
    InputComponent,
    ButtonComponent,
    ControlErrorPipe,
    SelectComponent,
    CommonModule,
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
      education: this.fb.array([]),
      workExperience: this.fb.array([]),

      // education
      organizationName: [""],
      entryYear: [null],
      completionYear: [null],
      description: [null],
      educationStatus: [null],
      educationLevel: [null],

      // work
      organizationNameWork: [""],
      entryYearWork: [null],
      completionYearWork: [null],
      descriptionWork: [null],
      jobPosition: [null],
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
        education: fv.education,
        workExperience: fv.workExperience,
      });
    });

    this.subscriptions$.push(profile$, formValueState$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  readonly yearListEducation = yearList;

  readonly educationStatusList = educationUserType;

  educationLevelList = educationUserLevel;

  stageForm: FormGroup;
  errorMessage = ErrorMessage;
  profile?: User;
  stageSubmitting = false;
  subscriptions$: Subscription[] = [];

  get education(): FormArray {
    return this.stageForm.get("education") as FormArray;
  }

  get workExperience(): FormArray {
    return this.stageForm.get("workExperience") as FormArray;
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    const educationItem = this.fb.group({
      organizationName: this.stageForm.get("organizationName")?.value,
      entryYear: this.stageForm.get("entryYear")?.value,
      completionYear: this.stageForm.get("completionYear")?.value,
      description: this.stageForm.get("description")?.value,
      educationStatus: this.stageForm.get("educationStatus")?.value,
      educationLevel: this.stageForm.get("educationLevel")?.value,
    });

    const workItem = this.fb.group({
      organizationName: this.stageForm.get("organizationNameWork")?.value,
      entryYear: this.stageForm.get("entryYearWork")?.value,
      completionYear: this.stageForm.get("completionYearWork")?.value,
      description: this.stageForm.get("descriptionWork")?.value,
      jobPosition: this.stageForm.get("jobPosition")?.value,
    });

    const educationItemFilled = Object.values(educationItem.value).some(
      value => value !== null && value !== ""
    );
    const workItemFilled = Object.values(workItem.value).some(
      value => value !== null && value !== ""
    );

    this.stageSubmitting = false;

    if (educationItemFilled) {
      if (!educationItem.get("organizationName")?.value) {
        this.stageForm.get("organizationName")?.setValidators([Validators.required]);
        this.stageForm.get("organizationName")?.markAsTouched();
        this.stageSubmitting = true;
        setTimeout(() => {
          this.stageSubmitting = false;
        }, 500);
      } else {
        this.education.push(educationItem);
        this.stageForm.get("organizationName")?.clearValidators();
        this.stageForm.get("organizationName")?.markAsPristine();
      }
      this.stageForm.get("organizationName")?.updateValueAndValidity();
    }

    if (workItemFilled) {
      if (!workItem.get("organizationName")?.value) {
        this.stageForm.get("organizationNameWork")?.setValidators([Validators.required]);
        this.stageForm.get("organizationNameWork")?.markAsTouched();
        this.stageSubmitting = true;
        setTimeout(() => {
          this.stageSubmitting = false;
        }, 500);
      } else {
        this.workExperience.push(workItem);
        this.stageForm.get("organizationNameWork")?.clearValidators();
        this.stageForm.get("organizationNameWork")?.markAsPristine();
      }
      this.stageForm.get("organizationNameWork")?.updateValueAndValidity();
    }

    if (this.stageSubmitting) {
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
