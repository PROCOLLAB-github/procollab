/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ButtonComponent } from "@ui/primitives";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/primitives/autocomplete-input/autocomplete-input.component";
import { SpecializationsGroupComponent } from "@ui/widgets/specializations-group/specializations-group.component";
import { Specialization } from "@domain/specializations/specialization.model";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { OnboardingStageOneUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-stage-one-ui-info.service";
import { OnboardingStageOneInfoService } from "@api/onboarding/facades/stages/onboarding-stage-one-info.service";
import { OnboardingUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-ui-info.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";

/** Этап онбординга — выбор специализации с автокомплитом и группированным списком. */
@Component({
    selector: "app-stage-one",
    templateUrl: "./stage-one.component.html",
    styleUrl: "./stage-one.component.scss",
    imports: [
        ReactiveFormsModule,
        ButtonComponent,
        ControlErrorPipe,
        AutoCompleteInputComponent,
        SpecializationsGroupComponent,
        CommonModule,
        TooltipComponent,
    ],
    providers: [
        OnboardingStageOneInfoService,
        OnboardingStageOneUIInfoService,
        OnboardingUIInfoService,
        TooltipInfoService,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingStageOneComponent implements OnInit {
  private readonly onboardingStageOneInfoService = inject(OnboardingStageOneInfoService);
  private readonly onboardingStageOneUIInfoService = inject(OnboardingStageOneUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  protected readonly stageForm = this.onboardingStageOneUIInfoService.stageForm;

  protected readonly isHintAuthVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintLibVisible = this.tooltipInfoService.isVisible;

  protected readonly inlineSpecializations =
    this.onboardingStageOneInfoService.inlineSpecializations;

  protected readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  protected readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

  // Для управления открытыми группами специализаций
  protected readonly openSpecializationGroup =
    this.onboardingStageOneUIInfoService.openSpecializationGroup;

  protected readonly nestedSpecializations$ =
    this.onboardingStageOneInfoService.nestedSpecializations$;

  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.onboardingStageOneInfoService.initializationFormValues();
  }

  ngAfterViewInit(): void {
    this.onboardingStageOneInfoService.initializationSpeciality();
  }

  toggleTooltip(key: "auth" | "lib"): void {
    this.tooltipInfoService.toggleTooltip(key);
  }

  //
  protected readonly hasOpenSpecializationsGroups =
    this.onboardingStageOneUIInfoService.hasOpenSpecializationsGroups;

  //
  onSpecializationsGroupToggled(isOpen: boolean, groupName: string): void {
    this.onboardingStageOneUIInfoService.onSpecializationsGroupToggled(isOpen, groupName);
  }
  isSpecializationGroupDisabled(groupName: string): boolean {
    return this.onboardingStageOneUIInfoService.isSpecializationGroupDisabled(groupName);
  }

  onSkipRegistration(): void {
    this.onboardingStageOneInfoService.onSkipRegistration();
  }

  onSubmit(): void {
    this.onboardingStageOneInfoService.onSubmit();
  }

  onSelectSpec(speciality: Specialization): void {
    this.onboardingStageOneInfoService.onSelectSpec(speciality);
  }

  onSearchSpec(query: string): void {
    this.onboardingStageOneInfoService.onSearchSpec(query);
  }
}
