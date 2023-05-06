/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { concatMap, Subscription } from "rxjs";
import { AuthService } from "@auth/services";
import { ValidationService } from "@core/services";
import { Router } from "@angular/router";

@Component({
  selector: "app-stage-one",
  templateUrl: "./stage-one.component.html",
  styleUrls: ["./stage-one.component.scss"],
})
export class OnboardingStageOneComponent implements OnInit, OnDestroy {
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly validationService: ValidationService,
    private readonly router: Router
  ) {
    this.stageFrom = this.fb.group({
      speciality: [""],
      keySkills: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const profile$ = this.authService.profile.subscribe(p => {
      this.stageFrom.patchValue({
        speciality: p.speciality,
        keySkills: p.keySkills,
      });

      p.keySkills?.forEach(skill => this.addKeySkill(skill));
    });
    this.subscriptions$.push(profile$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];
  stageFrom: FormGroup;

  newKeySkillTitle = "";

  get keySkills(): FormArray {
    return this.stageFrom.get("keySkills") as FormArray;
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

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageFrom)) {
      return;
    }

    this.authService
      .saveProfile(this.stageFrom.value)
      .pipe(concatMap(() => this.authService.setOnboardingStage(2)))
      .subscribe(() => {
        this.router
          .navigateByUrl("/office/onboarding/stage-2")
          .then(() => console.debug("Route changed from OnboardingStageOneComponent"));
      });
  }
}
