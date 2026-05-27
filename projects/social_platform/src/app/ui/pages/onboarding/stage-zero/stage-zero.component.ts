/** @format */

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ControlErrorPipe } from "@corelib";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/primitives";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { generateOptionsList } from "@utils/generate-options-list";
import { OnboardingStageZeroInfoService } from "@api/onboarding/facades/stages/onboarding-stage-zero-info.service";
import { OnboardingStageZeroUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-stage-zero-ui-info.service";
import { OnboardingUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-ui-info.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { AvatarControlComponent } from "@ui/primitives/avatar-control/avatar-control.component";

/** Начальный этап онбординга — сбор базовой информации профиля (фото, город, образование, опыт, языки, достижения). */
@Component({
  selector: "app-stage-zero",
  templateUrl: "./stage-zero.component.html",
  styleUrl: "./stage-zero.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    IconComponent,
    ControlErrorPipe,
    SelectComponent,
    ModalComponent,
    CommonModule,
    TooltipComponent,
    AvatarControlComponent,
  ],
  providers: [
    OnboardingStageZeroInfoService,
    OnboardingStageZeroUIInfoService,
    OnboardingUIInfoService,
    TooltipInfoService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingStageZeroComponent implements OnInit, OnDestroy {
  private readonly onboardingStageZeroInfoService = inject(OnboardingStageZeroInfoService);
  private readonly onboardingStageZeroUIInfoService = inject(OnboardingStageZeroUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  protected readonly isHintPhotoVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintCityVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintEducationVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintEducationDescriptionVisible = this.tooltipInfoService.isVisible;

  protected readonly isHintWorkVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintWorkNameVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintWorkDescriptionVisible = this.tooltipInfoService.isVisible;

  protected readonly isHintAchievementsVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintLanguageVisible = this.tooltipInfoService.isVisible;

  protected readonly yearListEducation = generateOptionsList(55, "years");

  protected readonly educationStatusList =
    this.onboardingStageZeroUIInfoService.educationStatusList;

  protected readonly educationLevelList = this.onboardingStageZeroUIInfoService.educationStatusList;

  protected readonly languageList = this.onboardingStageZeroUIInfoService.languageList;
  protected readonly languageLevelList = this.onboardingStageZeroUIInfoService.languageLevelList;

  protected readonly stageForm = this.onboardingStageZeroUIInfoService.stageForm;
  protected readonly profile = this.onboardingStageZeroUIInfoService.profile;
  protected readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  protected readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

  protected readonly educationItems = this.onboardingStageZeroUIInfoService.educationItems;

  protected readonly workItems = this.onboardingStageZeroUIInfoService.workItems;

  protected readonly languageItems = this.onboardingStageZeroUIInfoService.languageItems;

  protected readonly isModalErrorYear = this.onboardingStageZeroUIInfoService.isModalErrorYear;
  protected readonly isModalErrorYearText =
    this.onboardingStageZeroUIInfoService.isModalErrorYearText;

  protected readonly editIndex = this.onboardingStageZeroUIInfoService.editIndex;

  protected readonly editEducationClick = this.onboardingStageZeroUIInfoService.editEducationClick;
  protected readonly editWorkClick = this.onboardingStageZeroUIInfoService.editWorkClick;
  protected readonly editLanguageClick = this.onboardingStageZeroUIInfoService.editLanguageClick;

  protected readonly selectedEntryYearEducationId =
    this.onboardingStageZeroUIInfoService.selectedEntryYearEducationId;

  protected readonly selectedComplitionYearEducationId =
    this.onboardingStageZeroUIInfoService.selectedComplitionYearEducationId;

  protected readonly selectedEducationStatusId =
    this.onboardingStageZeroUIInfoService.selectedEducationStatusId;

  protected readonly selectedEducationLevelId =
    this.onboardingStageZeroUIInfoService.selectedEducationLevelId;

  protected readonly selectedEntryYearWorkId =
    this.onboardingStageZeroUIInfoService.selectedEntryYearWorkId;

  protected readonly selectedComplitionYearWorkId =
    this.onboardingStageZeroUIInfoService.selectedComplitionYearWorkId;

  protected readonly selectedLanguageId = this.onboardingStageZeroUIInfoService.selectedLanguageId;
  protected readonly selectedLanguageLevelId =
    this.onboardingStageZeroUIInfoService.selectedLanguageLevelId;

  protected readonly errorMessage = ErrorMessage;

  protected readonly achievements = this.onboardingStageZeroUIInfoService.achievements;
  protected readonly education = this.onboardingStageZeroUIInfoService.education;
  protected readonly workExperience = this.onboardingStageZeroUIInfoService.workExperience;
  protected readonly userLanguages = this.onboardingStageZeroUIInfoService.userLanguages;

  get isEducationDirty(): boolean {
    const f = this.stageForm;
    return [
      "organizationName",
      "entryYear",
      "completionYear",
      "description",
      "educationStatus",
      "educationLevel",
    ].some(name => f.get(name)?.dirty);
  }

  get isWorkDirty(): boolean {
    const f = this.stageForm;
    return [
      "organizationNameWork",
      "entryYearWork",
      "completionYearWork",
      "descriptionWork",
      "jobPosition",
    ].some(name => f.get(name)?.dirty);
  }

  get isLanguageDirty(): boolean {
    const f = this.stageForm;
    return ["language", "languageLevel"].some(name => f.get(name)?.dirty);
  }

  ngOnInit(): void {
    this.onboardingStageZeroInfoService.initializationStageZero();
  }

  ngAfterViewInit() {
    this.onboardingStageZeroInfoService.initializationFormValues();
  }

  ngOnDestroy(): void {
    this.onboardingStageZeroInfoService.destroy();
  }

  toggleTooltip(
    key:
      | "photo"
      | "city"
      | "education"
      | "educationDescription"
      | "work"
      | "workName"
      | "workDescription"
      | "achievements"
      | "language"
  ): void {
    this.tooltipInfoService.toggleTooltip(key);
  }

  addEducation() {
    this.onboardingStageZeroUIInfoService.addEducation();
  }

  editEducation(index: number) {
    this.onboardingStageZeroUIInfoService.editEducation(index);
  }

  removeEducation(i: number) {
    this.onboardingStageZeroUIInfoService.removeEducation(i);
  }

  addWork() {
    this.onboardingStageZeroUIInfoService.addWork();
  }

  editWork(index: number) {
    this.onboardingStageZeroUIInfoService.editWork(index);
  }

  removeWork(i: number) {
    this.onboardingStageZeroUIInfoService.removeWork(i);
  }

  addLanguage() {
    this.onboardingStageZeroUIInfoService.addLanguage();
  }

  editLanguage(index: number) {
    this.onboardingStageZeroUIInfoService.editLanguage(index);
  }

  removeLanguage(i: number) {
    this.onboardingStageZeroUIInfoService.removeLanguage(i);
  }

  addAchievement(id?: number, title?: string, status?: string): void {
    this.onboardingStageZeroUIInfoService.addAchievement(id, title, status);
  }

  removeAchievement(i: number): void {
    this.onboardingStageZeroUIInfoService.removeAchievement(i);
  }

  onSkipRegistration(): void {
    this.onboardingStageZeroInfoService.onSkipRegistration();
  }

  onSubmit(): void {
    this.onboardingStageZeroInfoService.onSubmit();
  }
}
