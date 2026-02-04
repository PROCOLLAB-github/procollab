/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ControlErrorPipe } from "projects/core";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/components";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { generateOptionsList } from "@utils/generate-options-list";
import { OnboardingStageZeroInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/onboarding-stage-zero-info.service";
import { OnboardingStageZeroUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-stage-zero-ui-info.service";
import { OnboardingUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-ui-info.service";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";

/**
 * КОМПОНЕНТ НУЛЕВОГО ЭТАПА ОНБОРДИНГА
 *
 * Назначение: Начальный этап сбора базовой информации профиля пользователя
 *
 * Что делает:
 * - Собирает основную информацию: фото, город, образование, опыт работы, языки, достижения
 * - Управляет сложными формами с динамическими массивами (FormArray)
 * - Валидирует данные с учетом временных диапазонов (годы обучения/работы)
 * - Предоставляет интерфейс для добавления/редактирования/удаления записей
 * - Поддерживает загрузку аватара пользователя
 * - Сохраняет данные в профиле и переходит к следующему этапу
 *
 * Что принимает:
 * - Текущий профиль пользователя из AuthService
 * - Состояние формы из OnboardingService
 * - Пользовательский ввод во все поля формы
 * - Файлы изображений для аватара
 *
 * Что возвращает:
 * - Комплексный интерфейс с множественными секциями:
 *   * Загрузка аватара
 *   * Поле города
 *   * Управление образованием (добавление/редактирование записей)
 *   * Управление опытом работы
 *   * Управление языками
 *   * Управление достижениями
 * - Модальные окна для ошибок валидации
 * - Навигацию на следующий этап (stage-1) или финальный (stage-3)
 *
 * Сложные функции управления данными:
 * - addEducation/editEducation/removeEducation: управление записями образования
 * - addWork/editWork/removeWork: управление записями опыта работы
 * - addLanguage/editLanguage/removeLanguage: управление языками
 * - addAchievement/removeAchievement: управление достижениями
 *
 * Валидация:
 * - Обязательные поля: аватар, город
 * - Валидация временных диапазонов (год начала < года окончания)
 * - Динамическая валидация для записей в массивах
 *
 * Состояние компонента:
 * - Множественные сигналы для управления элементами UI
 * - Отслеживание режимов редактирования для каждого типа записей
 * - Управление видимостью подсказок и модальных окон
 */
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
})
export class OnboardingStageZeroComponent implements OnInit, OnDestroy {
  private readonly onboardingStageZeroInfoService = inject(OnboardingStageZeroInfoService);
  private readonly onboardingStageZeroUIInfoService = inject(OnboardingStageZeroUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  protected readonly isHintPhotoVisible = this.tooltipInfoService.isHintPhotoVisible;
  protected readonly isHintCityVisible = this.tooltipInfoService.isHintCityVisible;
  protected readonly isHintEducationVisible = this.tooltipInfoService.isHintEducationVisible;
  protected readonly isHintEducationDescriptionVisible =
    this.tooltipInfoService.isHintEducationDescriptionVisible;

  protected readonly isHintWorkVisible = this.tooltipInfoService.isHintWorkVisible;
  protected readonly isHintWorkNameVisible = this.tooltipInfoService.isHintWorkNameVisible;
  protected readonly isHintWorkDescriptionVisible =
    this.tooltipInfoService.isHintWorkDescriptionVisible;

  protected readonly isHintAchievementsVisible = this.tooltipInfoService.isHintAchievementsVisible;
  protected readonly isHintLanguageVisible = this.tooltipInfoService.isHintLanguageVisible;

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
    option: "show" | "hide",
    type:
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
    option === "show"
      ? this.tooltipInfoService.showTooltip(type)
      : this.tooltipInfoService.hideTooltip(type);
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
