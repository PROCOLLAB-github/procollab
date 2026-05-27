/** @format */

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/primitives/autocomplete-input/autocomplete-input.component";
import { SkillsGroupComponent } from "@ui/widgets/skills-group/skills-group.component";
import { SkillsBasketComponent } from "@ui/widgets/skills-basket/skills-basket.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { Skill } from "@domain/skills/skill.model";
import { OnboardingUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-ui-info.service";
import { OnboardingStageTwoUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-stage-two-ui-info.service";
import { OnboardingStageTwoInfoService } from "@api/onboarding/facades/stages/onboarding-stage-two-info.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { SearchesService } from "@api/searches/searches.service";

/** Этап онбординга — выбор навыков с каталогом и корзиной. */
@Component({
  selector: "app-stage-two",
  templateUrl: "./stage-two.component.html",
  styleUrl: "./stage-two.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    ModalComponent,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SkillsGroupComponent,
    SkillsBasketComponent,
    TooltipComponent,
  ],
  providers: [
    OnboardingStageTwoInfoService,
    OnboardingStageTwoUIInfoService,
    OnboardingUIInfoService,
    TooltipInfoService,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingStageTwoComponent implements OnInit, OnDestroy {
  private readonly onboardingStageTwoInfoService = inject(OnboardingStageTwoInfoService);
  private readonly onboardingStageTwoUIInfoService = inject(OnboardingStageTwoUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly tooltipInfoService = inject(TooltipInfoService);
  private readonly searchesService = inject(SearchesService);

  protected readonly stageForm = this.onboardingStageTwoUIInfoService.stageForm;

  protected readonly nestedSkills$ = this.searchesService.getSkillsNested();

  protected readonly searchedSkills = this.onboardingStageTwoUIInfoService.searchedSkills;

  // Для управления открытыми группами навыков
  protected readonly openSkillGroup = this.onboardingStageTwoUIInfoService.openSkillGroup;

  protected readonly isHintAuthVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintLibVisible = this.tooltipInfoService.isVisible;

  protected readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  protected readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

  protected readonly isChooseSkill = this.onboardingStageTwoUIInfoService.isChooseSkill;
  protected readonly isChooseSkillText = this.onboardingStageTwoUIInfoService.isChooseSkillText;

  //
  protected readonly hasOpenSkillsGroups = this.onboardingStageTwoUIInfoService.hasOpenSkillsGroups;

  onSkillGroupToggled(isOpen: boolean, skillName: string): void {
    this.onboardingStageTwoUIInfoService.onSkillGroupToggled(isOpen, skillName);
  }

  isSkillGroupDisabled(skillName: string): boolean {
    return this.onboardingStageTwoUIInfoService.isSkillGroupDisabled(skillName);
  }

  ngOnInit(): void {
    this.onboardingStageTwoInfoService.initializationFormValues();
  }

  ngAfterViewInit(): void {
    this.onboardingStageTwoInfoService.initializationSkills();
  }

  ngOnDestroy(): void {
    this.onboardingStageTwoInfoService.destroy();
  }

  toggleTooltip(key: "auth" | "lib"): void {
    this.tooltipInfoService.toggleTooltip(key);
  }

  onSkipRegistration(): void {
    this.onboardingStageTwoInfoService.onSkipRegistration();
  }

  onSubmit(): void {
    this.onboardingStageTwoInfoService.onSubmit();
  }

  onAddSkill(newSkill: Skill): void {
    this.onboardingStageTwoInfoService.onAddSkill(newSkill);
  }

  onRemoveSkill(oddSkill: Skill): void {
    this.onboardingStageTwoInfoService.onRemoveSkill(oddSkill);
  }

  onOptionToggled(toggledSkill: Skill): void {
    this.onboardingStageTwoInfoService.onOptionToggled(toggledSkill);
  }

  onSearchSkill(query: string): void {
    this.onboardingStageTwoInfoService.onSearchSkill(query);
  }
}
