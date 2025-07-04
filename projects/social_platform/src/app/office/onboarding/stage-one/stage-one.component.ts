/** @format */

import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { concatMap, map, Observable, Subscription, take } from "rxjs";
import { AuthService } from "@auth/services";
import { ControlErrorPipe, ValidationService } from "@corelib";
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
    private readonly route: ActivatedRoute,
    private readonly cdref: ChangeDetectorRef
  ) {}

  stageForm = this.nnFb.group({
    speciality: [""],
  });

  nestedSpecializations$: Observable<SpecializationsGroup[]> = this.route.data.pipe(
    map(r => r["data"])
  );

  tooltipAuthText =
    "Дизайнер, веб-разработчик, инженер? Определяйся и пиши тем, кем хотел бы стать или уже стал P.S. Дальше можно будет изменить выбор";

  tooltipLibText =
    "Это наша база со всеми специальностями. Если не найдешь свою пиши в @procollab_support и мы обязательно добавим твою профессию и ты получишь +респект";

  isHintAuthVisible = false;
  isHintLibVisible = false;

  inlineSpecializations = signal<Specialization[]>([]);

  stageSubmitting = signal(false);
  skipSubmitting = signal(false);

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

  ngAfterViewInit(): void {
    const specialityProfile$ = this.onboardingService.formValue$.subscribe(fv => {
      this.stageForm.patchValue({ speciality: fv.speciality });
    });

    this.cdref.detectChanges();

    specialityProfile$ && this.subscriptions$().push(specialityProfile$);
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  showTooltip(type: "auth" | "lib"): void {
    type === "auth" ? (this.isHintAuthVisible = true) : (this.isHintLibVisible = true);
  }

  hideTooltip(type: "auth" | "lib"): void {
    type === "auth" ? (this.isHintAuthVisible = false) : (this.isHintLibVisible = false);
  }

  onSkipRegistration(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.completeRegistration(3);
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.stageSubmitting.set(true);

    this.authService
      .saveProfile(this.stageForm.value)
      .pipe(concatMap(() => this.authService.setOnboardingStage(2)))
      .subscribe({
        next: () => this.completeRegistration(2),
        error: () => this.stageSubmitting.set(false),
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

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(true);
    this.onboardingService.setFormValue(this.stageForm.value);
    this.router.navigateByUrl(
      stage === 2 ? "/office/onboarding/stage-2" : "/office/onboarding/stage-3"
    );
    this.skipSubmitting.set(false);
  }
}
