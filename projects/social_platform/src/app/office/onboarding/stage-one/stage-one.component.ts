/** @format */

import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { map, Observable, Subscription, take } from "rxjs";
import { AuthService } from "@auth/services";
import { ValidationService, ControlErrorPipe } from "@corelib";
import { ActivatedRoute, Router } from "@angular/router";
import { OnboardingService } from "../services/onboarding.service";
import { ButtonComponent, IconComponent, InputComponent } from "@ui/components";
import { TagComponent } from "@ui/components/tag/tag.component";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SpecializationsGroup } from "@office/models/specializations-group";
import { SpecializationsGroupComponent } from "@office/shared/specializations-group/specializations-group.component";
import { Specialization } from "@office/models/specialization";
import { SpecializationsService } from "@office/services/specializations.service";
import { ErrorMessage } from "@error/models/error-message";

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
    InputComponent,
    AutoCompleteInputComponent,
    SpecializationsGroupComponent,
    CommonModule,
  ],
})
export class OnboardingStageOneComponent implements OnInit, OnDestroy {
  constructor(
    private readonly nnFb: NonNullableFormBuilder,
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly validationService: ValidationService,
    private readonly specsService: SpecializationsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  stageForm = this.nnFb.group({
    speciality: ["", Validators.required],
  });

  nestedSpecializations$: Observable<SpecializationsGroup[]> = this.route.data.pipe(
    map(r => r["data"])
  );

  inlineSpecializations = signal<Specialization[]>([]);

  stageSubmitting = signal(false);

  errorMessage = ErrorMessage;

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const formValueState$ = this.onboardingService.formValue$.pipe(take(1)).subscribe(fv => {
      this.stageForm.patchValue({
        speciality: fv.speciality,
      });
    });

    const formValueChange$ = this.stageForm.valueChanges.subscribe(value => {
      this.onboardingService.setFormValue(value);
    });

    this.subscriptions$().push(formValueState$, formValueChange$);
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.stageSubmitting.set(true);

    this.authService.saveProfile(this.stageForm.value).subscribe(() => {
      this.router
        .navigateByUrl("/office/onboarding/stage-2")
        .then(() => console.debug("Route changed from OnboardingStageOneComponent"));
    });
  }

  onSelectSpec(speciality: Specialization): void {
    this.stageForm.patchValue({ speciality: speciality.name });
  }

  onSearchSpec(query: string): void {
    this.specsService
      .getSpecializationsInline(query, 1000, 0)
      .pipe(take(1))
      .subscribe(({ results }) => {
        this.inlineSpecializations.set(results);
      });
  }
}
