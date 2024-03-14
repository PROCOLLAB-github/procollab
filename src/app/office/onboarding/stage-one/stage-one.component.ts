/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { concatMap, Subscription, take } from "rxjs";
import { AuthService } from "@auth/services";
import { ValidationService } from "@core/services";
import { Router } from "@angular/router";
import { OnboardingService } from "../services/onboarding.service";
import { ControlErrorPipe } from "@core/pipes/control-error.pipe";
import { ButtonComponent, IconComponent, InputComponent } from "@ui/components";
import { TagComponent } from "@ui/components/tag/tag.component";

@Component({
  selector: "app-stage-one",
  templateUrl: "./stage-one.component.html",
  styleUrl: "./stage-one.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    TagComponent,
    IconComponent,
    ButtonComponent,
    ControlErrorPipe,
  ],
})
export class OnboardingStageOneComponent implements OnInit, OnDestroy {
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly validationService: ValidationService,
    private readonly router: Router
  ) {
    this.stageForm = this.fb.group({
      speciality: [""],
      keySkills: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const formValueState$ = this.onboardingService.formValue$.pipe(take(1)).subscribe(fv => {
      this.stageForm.patchValue({
        speciality: fv.speciality,
        keySkills: fv.keySkills,
      });

      fv.keySkills?.forEach(skill => this.addKeySkill(skill));
    });

    const formValueChange$ = this.stageForm.valueChanges.subscribe(value => {
      this.onboardingService.setFormValue(value);
    });

    this.subscriptions$.push(formValueState$, formValueChange$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];
  stageForm: FormGroup;

  newKeySkillTitle = "";

  get keySkills(): FormArray {
    return this.stageForm.get("keySkills") as FormArray;
  }

  addKeySkill(title?: string): void {
    const fromState = title ?? this.newKeySkillTitle;
    if (!fromState) {
      return;
    }

    const control = this.fb.control(fromState, [Validators.required]);
    this.keySkills.push(control);

    this.newKeySkillTitle = "";
  }

  removeKeySkill(i: number): void {
    this.keySkills.removeAt(i);
  }

  errorMessage = ErrorMessage;
  stageSubmitting = false;

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.stageSubmitting = true;

    this.authService
      .saveProfile(this.stageForm.value)
      .pipe(concatMap(() => this.authService.setOnboardingStage(2)))
      .subscribe(() => {
        this.router
          .navigateByUrl("/office/onboarding/stage-2")
          .then(() => console.debug("Route changed from OnboardingStageOneComponent"));
      });
  }
}
