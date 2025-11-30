/** @format */

import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { ControlErrorPipe, ValidationService, YearsFromBirthdayPipe } from "projects/core";
import { concatMap, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { User } from "@auth/models/user.model";
import { OnboardingService } from "../services/onboarding.service";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/components";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { CommonModule } from "@angular/common";
import {
  educationUserLevel,
  educationUserType,
} from "projects/core/src/consts/lists/education-info-list.const";
import {
  languageLevelsList,
  languageNamesList,
} from "projects/core/src/consts/lists/language-info-list.const";
import { IconComponent } from "@uilib";
import { transformYearStringToNumber } from "@utils/helpers/transformYear";
import { yearRangeValidators } from "@utils/helpers/yearRangeValidators";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { generateOptionsList } from "@utils/generate-options-list";

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
    AvatarControlComponent,
    InputComponent,
    ButtonComponent,
    IconComponent,
    ControlErrorPipe,
    SelectComponent,
    ModalComponent,
    CommonModule,
    TooltipComponent,
  ],
})
export class OnboardingStageZeroComponent implements OnInit, OnDestroy {
  constructor(
    public readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly router: Router,
    private readonly cdref: ChangeDetectorRef
  ) {
    this.stageForm = this.fb.group({
      avatar: ["", [Validators.required]],
      city: ["", [Validators.required]],

      education: this.fb.array([]),
      workExperience: this.fb.array([]),
      userLanguages: this.fb.array([]),
      achievements: this.fb.array([]),

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

      // language
      language: [null],
      languageLevel: [null],
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

  ngAfterViewInit() {
    const onboardingProfile$ = this.onboardingService.formValue$.subscribe(formValues => {
      this.stageForm.patchValue({
        avatar: formValues.avatar ?? "",
        city: formValues.city ?? "",
      });

      this.workExperience.clear();
      formValues.workExperience?.forEach(work => {
        this.workExperience.push(
          this.fb.group(
            {
              organizationName: work.organizationName,
              entryYear: work.entryYear,
              completionYear: work.completionYear,
              description: work.description,
              jobPosition: work.jobPosition,
            },
            {
              validators: yearRangeValidators("entryYear", "completionYear"),
            }
          )
        );
      });

      this.education.clear();
      formValues?.education?.forEach(edu => {
        this.education.push(
          this.fb.group(
            {
              organizationName: edu.organizationName,
              entryYear: edu.entryYear,
              completionYear: edu.completionYear,
              description: edu.description,
              educationStatus: edu.educationStatus,
              educationLevel: edu.educationLevel,
            },
            {
              validators: yearRangeValidators("entryYear", "completionYear"),
            }
          )
        );
      });

      this.userLanguages.clear();
      formValues.userLanguages?.forEach(lang => {
        this.userLanguages.push(
          this.fb.group({
            language: lang.language,
            languageLevel: lang.languageLevel,
          })
        );
      });

      this.cdref.detectChanges();

      formValues.achievements?.length &&
        formValues.achievements?.forEach(achievement =>
          this.addAchievement(achievement.id, achievement.title, achievement.status)
        );
    });
    onboardingProfile$ && this.subscriptions$.push(onboardingProfile$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  isHintPhotoVisible = false;
  isHintCityVisible = false;
  isHintEducationVisible = false;
  isHintEducationDescriptionVisible = false;
  isHintWorkVisible = false;
  isHintWorkNameVisible = false;
  isHintWorkDescriptionVisible = false;
  isHintAchievementsVisible = false;
  isHintLanguageVisible = false;

  readonly yearListEducation = generateOptionsList(55, "years");

  readonly educationStatusList = educationUserType;

  readonly educationLevelList = educationUserLevel;

  readonly languageList = languageNamesList;

  readonly languageLevelList = languageLevelsList;

  stageForm: FormGroup;
  errorMessage = ErrorMessage;
  profile?: User;
  stageSubmitting = signal(false);
  skipSubmitting = signal(false);

  educationItems = signal<any[]>([]);

  workItems = signal<any[]>([]);

  languageItems = signal<any[]>([]);

  isModalErrorYear = signal(false);
  isModalErrorYearText = signal("");

  editIndex = signal<number | null>(null);

  editEducationClick = false;
  editWorkClick = false;
  editLanguageClick = false;

  selectedEntryYearEducationId = signal<number | undefined>(undefined);
  selectedComplitionYearEducationId = signal<number | undefined>(undefined);
  selectedEducationStatusId = signal<number | undefined>(undefined);
  selectedEducationLevelId = signal<number | undefined>(undefined);

  selectedEntryYearWorkId = signal<number | undefined>(undefined);
  selectedComplitionYearWorkId = signal<number | undefined>(undefined);

  selectedLanguageId = signal<number | undefined>(undefined);
  selectedLanguageLevelId = signal<number | undefined>(undefined);

  subscriptions$: Subscription[] = [];

  get achievements(): FormArray {
    return this.stageForm.get("achievements") as FormArray;
  }

  get education(): FormArray {
    return this.stageForm.get("education") as FormArray;
  }

  get workExperience(): FormArray {
    return this.stageForm.get("workExperience") as FormArray;
  }

  get userLanguages(): FormArray {
    return this.stageForm.get("userLanguages") as FormArray;
  }

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

  showTooltip(
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
    switch (type) {
      case "photo":
        this.isHintPhotoVisible = true;
        break;
      case "city":
        this.isHintCityVisible = true;
        break;
      case "education":
        this.isHintEducationVisible = true;
        break;
      case "educationDescription":
        this.isHintEducationDescriptionVisible = true;
        break;
      case "work":
        this.isHintWorkVisible = true;
        break;
      case "workName":
        this.isHintWorkNameVisible = true;
        break;
      case "workDescription":
        this.isHintWorkDescriptionVisible = true;
        break;
      case "achievements":
        this.isHintAchievementsVisible = true;
        break;
      case "language":
        this.isHintLanguageVisible = true;
        break;
    }
  }

  hideTooltip(
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
    switch (type) {
      case "photo":
        this.isHintPhotoVisible = false;
        break;
      case "city":
        this.isHintCityVisible = false;
        break;
      case "education":
        this.isHintEducationVisible = false;
        break;
      case "educationDescription":
        this.isHintEducationDescriptionVisible = false;
        break;
      case "work":
        this.isHintWorkVisible = false;
        break;
      case "workName":
        this.isHintWorkNameVisible = false;
        break;
      case "workDescription":
        this.isHintWorkDescriptionVisible = false;
        break;
      case "achievements":
        this.isHintAchievementsVisible = false;
        break;
      case "language":
        this.isHintLanguageVisible = false;
        break;
    }
  }

  addEducation() {
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.clearValidators()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.setValidators([Validators.required])
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.updateValueAndValidity()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.stageForm.get(name)?.markAsTouched()
    );

    const entryYear =
      typeof this.stageForm.get("entryYear")?.value === "string"
        ? +this.stageForm.get("entryYear")?.value.slice(0, 5)
        : this.stageForm.get("entryYear")?.value;
    const completionYear =
      typeof this.stageForm.get("completionYear")?.value === "string"
        ? +this.stageForm.get("completionYear")?.value.slice(0, 5)
        : this.stageForm.get("completionYear")?.value;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.isModalErrorYear.set(true);
      this.isModalErrorYearText.set("Год начала обучения должен быть меньше года окончания");
      return;
    }

    const educationItem = this.fb.group({
      organizationName: this.stageForm.get("organizationName")?.value,
      entryYear,
      completionYear,
      description: this.stageForm.get("description")?.value,
      educationStatus: this.stageForm.get("educationStatus")?.value,
      educationLevel: this.stageForm.get("educationLevel")?.value,
    });

    const isOrganizationValid = this.stageForm.get("organizationName")?.valid;
    const isStatusValid = this.stageForm.get("educationStatus")?.valid;

    if (isOrganizationValid && isStatusValid) {
      if (this.editIndex() !== null) {
        this.educationItems.update(items => {
          const updatedItems = [...items];
          updatedItems[this.editIndex()!] = educationItem.value;

          this.education.at(this.editIndex()!).patchValue(educationItem.value);
          return updatedItems;
        });
        this.editIndex.set(null);
      } else {
        this.educationItems.update(items => [...items, educationItem.value]);
        this.education.push(educationItem);
      }
      [
        "organizationName",
        "entryYear",
        "completionYear",
        "description",
        "educationStatus",
        "educationLevel",
      ].forEach(name => {
        this.stageForm.get(name)?.reset();
        this.stageForm.get(name)?.setValue("");
        this.stageForm.get(name)?.clearValidators();
        this.stageForm.get(name)?.markAsPristine();
        this.stageForm.get(name)?.updateValueAndValidity();
      });
    }
    this.editEducationClick = false;
  }

  editEducation(index: number) {
    this.editEducationClick = true;
    const educationItem = this.education.value[index];

    this.yearListEducation.forEach(entryYearWork => {
      if (transformYearStringToNumber(entryYearWork.value as string) === educationItem.entryYear) {
        this.selectedEntryYearEducationId.set(entryYearWork.id);
      }
    });

    this.yearListEducation.forEach(completionYearWork => {
      if (
        transformYearStringToNumber(completionYearWork.value as string) ===
        educationItem.completionYear
      ) {
        this.selectedComplitionYearEducationId.set(completionYearWork.id);
      }
    });

    this.educationLevelList.forEach(educationLevel => {
      if (educationLevel.value === educationItem.educationLevel) {
        this.selectedEducationLevelId.set(educationLevel.id);
      }
    });

    this.educationStatusList.forEach(educationStatus => {
      if (educationStatus.value === educationItem.educationStatus) {
        this.selectedEducationStatusId.set(educationStatus.id);
      }
    });

    this.stageForm.patchValue({
      organizationName: educationItem.organizationName,
      entryYear: educationItem.entryYear,
      completionYear: educationItem.completionYear,
      description: educationItem.description,
      educationStatus: educationItem.educationStatus,
      educationLevel: educationItem.educationLevel,
    });
    this.editIndex.set(index);
  }

  removeEducation(i: number) {
    this.educationItems.update(items => items.filter((_, index) => index !== i));

    this.education.removeAt(i);
  }

  addWork() {
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.clearValidators()
    );
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.setValidators([Validators.required])
    );
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.updateValueAndValidity()
    );
    ["organizationNameWork", "jobPosition"].forEach(name =>
      this.stageForm.get(name)?.markAsTouched()
    );

    const entryYear =
      typeof this.stageForm.get("entryYearWork")?.value === "string"
        ? +this.stageForm.get("entryYearWork")?.value.slice(0, 5)
        : this.stageForm.get("entryYearWork")?.value;
    const completionYear =
      typeof this.stageForm.get("completionYearWork")?.value === "string"
        ? +this.stageForm.get("completionYearWork")?.value.slice(0, 5)
        : this.stageForm.get("completionYearWork")?.value;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.isModalErrorYear.set(true);
      this.isModalErrorYearText.set("Год начала работы должен быть меньше года окончания");
      return;
    }

    const workItem = this.fb.group({
      organizationName: this.stageForm.get("organizationNameWork")?.value,
      entryYear,
      completionYear,
      description: this.stageForm.get("descriptionWork")?.value,
      jobPosition: this.stageForm.get("jobPosition")?.value,
    });

    const isOrganizationValid = this.stageForm.get("organizationNameWork")?.valid;
    const isPositionValid = this.stageForm.get("jobPosition")?.valid;

    if (isOrganizationValid && isPositionValid) {
      if (this.editIndex() !== null) {
        this.workItems.update(items => {
          const updatedItems = [...items];
          updatedItems[this.editIndex()!] = workItem.value;

          this.workExperience.at(this.editIndex()!).patchValue(workItem.value);
          return updatedItems;
        });
        this.editIndex.set(null);
      } else {
        this.workItems.update(items => [...items, workItem.value]);
        this.workExperience.push(workItem);
      }
      [
        "organizationNameWork",
        "entryYearWork",
        "completionYearWork",
        "descriptionWork",
        "jobPosition",
      ].forEach(name => {
        this.stageForm.get(name)?.reset();
        this.stageForm.get(name)?.setValue("");
        this.stageForm.get(name)?.clearValidators();
        this.stageForm.get(name)?.markAsPristine();
        this.stageForm.get(name)?.updateValueAndValidity();
      });
    }
    this.editWorkClick = false;
  }

  editWork(index: number) {
    this.editWorkClick = true;
    const workItem = this.workExperience.value[index];

    if (workItem) {
      this.yearListEducation.forEach(entryYearWork => {
        if (
          transformYearStringToNumber(entryYearWork.value as string) === workItem.entryYearWork ||
          transformYearStringToNumber(entryYearWork.value as string) === workItem.entryYear
        ) {
          this.selectedEntryYearWorkId.set(entryYearWork.id);
        }
      });

      this.yearListEducation.forEach(complitionYearWork => {
        if (
          transformYearStringToNumber(complitionYearWork.value as string) ===
            workItem.completionYearWork ||
          transformYearStringToNumber(complitionYearWork.value as string) ===
            workItem.completionYear
        ) {
          this.selectedComplitionYearWorkId.set(complitionYearWork.id);
        }
      });

      this.stageForm.patchValue({
        organizationNameWork: workItem.organization || workItem.organizationName,
        entryYearWork: workItem.entryYearWork || workItem.entryYear,
        completionYearWork: workItem.completionYearWork || workItem.completionYear,
        descriptionWork: workItem.descriptionWork || workItem.description,
        jobPosition: workItem.jobPosition,
      });
      this.editIndex.set(index);
    }
  }

  removeWork(i: number) {
    this.workItems.update(items => items.filter((_, index) => index !== i));

    this.workExperience.removeAt(i);
  }

  addLanguage() {
    const languageValue = this.stageForm.get("language")?.value;
    const languageLevelValue = this.stageForm.get("languageLevel")?.value;

    ["language", "languageLevel"].forEach(name => {
      this.stageForm.get(name)?.clearValidators();
    });

    if ((languageValue && !languageLevelValue) || (!languageValue && languageLevelValue)) {
      ["language", "languageLevel"].forEach(name => {
        this.stageForm.get(name)?.setValidators([Validators.required]);
      });
    }

    ["language", "languageLevel"].forEach(name => {
      this.stageForm.get(name)?.updateValueAndValidity();
      this.stageForm.get(name)?.markAsTouched();
    });

    const isLanguageValid = this.stageForm.get("language")?.valid;
    const isLanguageLevelValid = this.stageForm.get("languageLevel")?.valid;

    if (!isLanguageValid || !isLanguageLevelValid) {
      return;
    }

    const languageItem = this.fb.group({
      language: languageValue,
      languageLevel: languageLevelValue,
    });

    if (languageValue && languageLevelValue) {
      if (this.editIndex() !== null) {
        this.languageItems.update(items => {
          const updatedItems = [...items];
          updatedItems[this.editIndex()!] = languageItem.value;

          this.userLanguages.at(this.editIndex()!).patchValue(languageItem.value);
          return updatedItems;
        });
        this.editIndex.set(null);
      } else {
        this.languageItems.update(items => [...items, languageItem.value]);
        this.userLanguages.push(languageItem);
      }
      ["language", "languageLevel"].forEach(name => {
        this.stageForm.get(name)?.reset();
        this.stageForm.get(name)?.setValue(null);
        this.stageForm.get(name)?.clearValidators();
        this.stageForm.get(name)?.markAsPristine();
        this.stageForm.get(name)?.updateValueAndValidity();
      });

      this.editLanguageClick = false;
    }
  }

  editLanguage(index: number) {
    this.editLanguageClick = true;
    const languageItem = this.userLanguages.value[index];

    this.languageList.forEach(language => {
      if (language.value === languageItem.language) {
        this.selectedLanguageId.set(language.id);
      }
    });

    this.languageLevelList.forEach(languageLevel => {
      if (languageLevel.value === languageItem.languageLevel) {
        this.selectedLanguageLevelId.set(languageLevel.id);
      }
    });

    this.stageForm.patchValue({
      language: languageItem.language,
      languageLevel: languageItem.languageLevel,
    });

    this.editIndex.set(index);
  }

  removeLanguage(i: number) {
    this.languageItems.update(items => items.filter((_, index) => index !== i));

    this.userLanguages.removeAt(i);
  }

  addAchievement(id?: number, title?: string, status?: string): void {
    this.achievements.push(
      this.fb.group({
        title: [title ?? "", [Validators.required]],
        status: [status ?? "", [Validators.required]],
        id: [id],
      })
    );
  }

  removeAchievement(i: number): void {
    this.achievements.removeAt(i);
  }

  onSkipRegistration(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    const onboardingSkipInfo = {
      avatar: this.stageForm.get("avatar")?.value,
      city: this.stageForm.get("city")?.value,
    };

    this.skipSubmitting.set(true);
    this.authService.saveProfile(onboardingSkipInfo).subscribe({
      next: () => this.completeRegistration(3),
      error: error => {
        this.skipSubmitting.set(false);
        this.isModalErrorYear.set(true);
        this.isModalErrorYearText.set(error.error?.message || "Ошибка сохранения");
      },
    });
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      this.achievements.markAllAsTouched();
      return;
    }

    const newStageForm = {
      avatar: this.stageForm.get("avatar")?.value,
      city: this.stageForm.get("city")?.value,
      education: this.education.value,
      workExperience: this.workExperience.value,
      userLanguages: this.userLanguages.value,
      achievements: this.achievements.value,
    };

    this.stageSubmitting.set(true);
    this.authService
      .saveProfile(newStageForm)
      .pipe(concatMap(() => this.authService.setOnboardingStage(1)))
      .subscribe({
        next: () => this.completeRegistration(1),
        error: error => {
          this.stageSubmitting.set(false);
          this.isModalErrorYear.set(true);
          if (error.error.language) {
            this.isModalErrorYearText.set(error.error.language);
          }
        },
      });
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(true);
    this.onboardingService.setFormValue(this.stageForm.value);
    this.router.navigateByUrl(
      stage === 1 ? "/office/onboarding/stage-1" : "/office/onboarding/stage-3"
    );
    this.skipSubmitting.set(false);
  }
}
