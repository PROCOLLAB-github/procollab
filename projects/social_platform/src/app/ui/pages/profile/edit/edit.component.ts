/** @format */

import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ButtonComponent, IconComponent } from "@ui/components";
import { RouterModule } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import { EditorSubmitButtonDirective } from "@ui/directives/editor-submit-button.directive";
import { AsyncPipe, CommonModule } from "@angular/common";
import { Specialization } from "projects/social_platform/src/app/domain/specializations/specialization";
import { SkillsGroupComponent } from "@ui/shared/skills-group/skills-group.component";
import { SpecializationsGroupComponent } from "@ui/shared/specializations-group/specializations-group.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { navProfileItems } from "projects/core/src/consts/navigation/nav-profile-items.const";
import { SpecializationsService } from "projects/social_platform/src/app/api/specializations/specializations.service";
import { SkillsService } from "projects/social_platform/src/app/api/skills/skills.service";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { ProfileFormService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-form.service";
import { ProjectStepService } from "projects/social_platform/src/app/api/project/project-step.service";
import { ProfileEditInfoService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-edit-info.service";
import { SkillsInfoService } from "projects/social_platform/src/app/api/skills/facades/skills-info.service";
import { OnboardingStageOneUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-stage-one-ui-info.service";
import { OnboardingStageOneInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/onboarding-stage-one-info.service";
import { ProjectVacancyUIService } from "projects/social_platform/src/app/api/project/facades/edit/ui/project-vacancy-ui.service";
import { ProfileEditEducationInfoService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-edit-education-info.service";
import { ProfileEditExperienceInfoService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-edit-experience-info.service";
import { ProfileEditSkillsInfoService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-edit-skills-info.service";
import { ProjectNavigationComponent } from "@ui/pages/projects/edit/components/project-navigation/project-navigation.component";
import { ProfileMainStepComponent } from "./components/profile-main-step/profile-main-step.component";
import { ProfileEducationStepComponent } from "./components/profile-education-step/profile-education-step.component";
import { ProfileExperienceStepComponent } from "./components/profile-experience-step/profile-experience-step.component";
import { ProfileAchievementsStepComponent } from "./components/profile-achievements-step/profile-achievements-step.component";
import { ProfileSkillsStepComponent } from "./components/profile-skills-step/profile-skills-step.component";
import { OnboardingUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-ui-info.service";

dayjs.extend(cpf);

/**
 * Компонент редактирования профиля пользователя
 *
 * Этот компонент предоставляет полнофункциональную форму для редактирования профиля пользователя
 * с поддержкой множественных разделов (основная информация, образование, опыт работы, достижения, навыки).
 *
 * Основные возможности:
 * - Редактирование основной информации (имя, фамилия, дата рождения, город, телефон)
 * - Управление образованием (добавление, редактирование, удаление записей об образовании)
 * - Управление опытом работы (добавление, редактирование, удаление записей о работе)
 * - Управление языками (добавление, редактирование, удаление языковых навыков)
 * - Управление достижениями (добавление, редактирование, удаление достижений)
 * - Управление навыками через автокомплит и модальные окна с группировкой
 * - Загрузка и обновление аватара пользователя
 * - Пошаговая навигация между разделами формы
 * - Валидация всех полей формы с отображением ошибок
 *
 * @implements OnInit - для инициализации компонента и подписок
 * @implements OnDestroy - для очистки подписок
 * @implements AfterViewInit - для работы с DOM после инициализации представления
 */
@Component({
  selector: "app-profile-edit",
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    IconComponent,
    ButtonComponent,
    EditorSubmitButtonDirective,
    AsyncPipe,
    SkillsGroupComponent,
    SpecializationsGroupComponent,
    ModalComponent,
    RouterModule,
    ProjectNavigationComponent,
    ProfileMainStepComponent,
    ProfileEducationStepComponent,
    ProfileExperienceStepComponent,
    ProfileAchievementsStepComponent,
    ProfileSkillsStepComponent,
  ],
  providers: [
    ProfileEditInfoService,
    OnboardingStageOneUIInfoService,
    OnboardingStageOneInfoService,
    OnboardingUIInfoService,
    ProfileEditEducationInfoService,
    ProfileEditExperienceInfoService,
    ProfileEditSkillsInfoService,
  ],
})
export class ProfileEditComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditInfoService = inject(ProfileEditInfoService);
  private readonly projectStepService = inject(ProjectStepService);
  private readonly specsService = inject(SpecializationsService);
  private readonly skillsInfoService = inject(SkillsInfoService);
  private readonly skillsService = inject(SkillsService);
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly onboardingStageOneUIInfoService = inject(OnboardingStageOneUIInfoService);
  private readonly onboardingStageOneInfoService = inject(OnboardingStageOneInfoService);
  private readonly profileEditEducationInfoService = inject(ProfileEditEducationInfoService);
  private readonly profileEditExperienceInfoService = inject(ProfileEditExperienceInfoService);
  private readonly profileEditSkillsInfoService = inject(ProfileEditSkillsInfoService);

  protected readonly profileForm = this.profileFormService.getForm();

  /**
   * Инициализация компонента
   * Настраивает форму, подписки на изменения, валидацию и заголовок навигации
   */
  ngOnInit(): void {
    this.profileEditInfoService.initializationEditInfo();

    // const isMospolytechStudentSub$ = this.profileForm
    //   .get("isMospolytechStudent")
    //   ?.valueChanges.subscribe(isStudent => {
    //     const studyGroup = this.profileForm.get("studyGroup");
    //     if (isStudent) {
    //       studyGroup?.setValidators([Validators.required]);
    //     } else {
    //       studyGroup?.clearValidators();
    //     }

    //     studyGroup?.updateValueAndValidity();
    //   });

    // isMospolytechStudentSub$ && this.subscription$.push(isMospolytechStudentSub$);
  }

  /**
   * Инициализация после создания представления
   * Загружает данные профиля пользователя и заполняет форму
   */
  ngAfterViewInit() {
    this.profileFormService.initializeProfileData();
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок
   */
  ngOnDestroy(): void {
    this.profileFormService.destroy();
  }

  readonly editingStep = this.projectStepService.currentStep;

  protected readonly profileId = this.profileEditInfoService.profileId;

  protected readonly inlineSpecs = this.profileFormService.inlineSpecs;

  protected readonly nestedSpecs$ = this.specsService.getSpecializationsNested();

  protected readonly specsGroupsModalOpen = signal(false);

  protected readonly inlineSkills = this.skillsInfoService.inlineSkills;

  protected readonly nestedSkills$ = this.skillsService.getSkillsNested();

  protected readonly skillsGroupsModalOpen = this.projectVacancyUIService.skillsGroupsModalOpen;

  protected readonly openGroupIndex = this.profileEditInfoService.openGroupIndex;

  protected readonly editEducationClick = this.profileEditEducationInfoService.editEducationClick;
  protected readonly editWorkClick = this.profileEditExperienceInfoService.editWorkClick;
  protected readonly editLanguageClick = this.profileEditSkillsInfoService.editLanguageClick;

  onGroupToggled(index: number, isOpen: boolean) {
    this.profileEditInfoService.onGroupToggled(index, isOpen);
  }

  isGroupDisabled(index: number): boolean {
    return this.profileEditInfoService.isGroupDisabled(index);
  }

  protected readonly isModalErrorSkillsChoose =
    this.profileEditInfoService.isModalErrorSkillsChoose;
  protected readonly isModalErrorSkillChooseText =
    this.profileEditInfoService.isModalErrorSkillChooseText;

  protected readonly isModalDeleteProfile = signal(false);

  protected readonly editIndex = this.profileEditInfoService.editIndex;

  readonly navProfileItems = navProfileItems;

  /**
   * Навигация между шагами редактирования профиля
   * @param step - название шага ('main' | 'education' | 'experience' | 'achievements' | 'skills' | 'settings)
   */
  navigateStep(step: string) {
    this.projectStepService.setStepFromRoute(step);
  }

  protected readonly typeSpecific = this.profileFormService.typeSpecific;

  protected readonly usefulToProject = this.profileFormService.usefulToProject;

  protected readonly preferredIndustries = this.profileFormService.preferredIndustries;

  protected readonly newPreferredIndustryTitle = this.profileFormService.newPreferredIndustryTitle;

  addPreferredIndustry(title?: string): void {
    this.profileFormService.addPreferredIndustry(title);
  }

  removePreferredIndustry(i: number): void {
    this.profileFormService.removePreferredIndustry(i);
  }

  get isEducationDirty(): boolean {
    const f = this.profileForm;
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
    const f = this.profileForm;
    return [
      "organization",
      "entryYearWork",
      "completionYearWork",
      "descriptionWork",
      "jobPosition",
    ].some(name => f.get(name)?.dirty);
  }

  get isLanguageDirty(): boolean {
    const f = this.profileForm;
    return ["language", "languageLevel"].some(name => f.get(name)?.dirty);
  }

  get isAchievementsDirty(): boolean {
    const f = this.profileForm;
    return ["title", "status", "year", "files"].some(name => f.get(name)?.dirty);
  }

  protected readonly errorMessage = ErrorMessage;

  protected readonly roles = this.profileFormService.roles;

  protected readonly profileFormSubmitting = this.profileEditInfoService.profileFormSubmitting;

  // Для управления открытыми группами специализаций
  protected readonly openSpecializationGroup =
    this.onboardingStageOneUIInfoService.openSpecializationGroup;

  /**
   * Проверяет, есть ли открытые группы специализаций
   */
  protected readonly hasOpenSpecializationsGroups =
    this.onboardingStageOneUIInfoService.hasOpenSpecializationsGroups;

  /**
   * Проверяет, должна ли группа специализаций быть отключена
   * @param groupName - название группы для проверки
   */
  isSpecializationGroupDisabled(groupName: string): boolean {
    return this.onboardingStageOneUIInfoService.isSpecializationGroupDisabled(groupName);
  }

  /**
   * Обработчик переключения группы специализаций
   * @param isOpen - флаг открытия/закрытия группы
   * @param groupName - название группы
   */
  onSpecializationsGroupToggled(isOpen: boolean, groupName: string): void {
    this.onboardingStageOneUIInfoService.onSpecializationsGroupToggled(isOpen, groupName);
  }

  /**
   * Сохранение профиля пользователя
   * Валидирует всю форму и отправляет данные на сервер
   */
  saveProfile(): void {
    this.profileEditInfoService.saveProfile();
  }

  /**
   * Выбор специальности из автокомплита
   * @param speciality - выбранная специальность
   */
  onSelectSpec(speciality: Specialization): void {
    this.onboardingStageOneInfoService.onSelectSpec(speciality);
  }

  /**
   * Переключение навыка (добавление/удаление)
   * @param toggledSkill - навык для переключения
   */
  onToggleSkill(toggledSkill: Skill): void {
    this.skillsInfoService.onToggleSkill(toggledSkill, this.profileForm);
  }

  /**
   * Добавление нового навыка
   * @param newSkill - новый навык для добавления
   */
  onAddSkill(newSkill: Skill): void {
    this.skillsInfoService.onAddSkill(newSkill, this.profileForm);
  }

  /**
   * Удаление навыка
   * @param oddSkill - навык для удаления
   */
  onRemoveSkill(oddSkill: Skill): void {
    this.skillsInfoService.onRemoveSkill(oddSkill, this.profileForm);
  }

  toggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }

  toggleSpecsGroupsModal(): void {
    this.specsGroupsModalOpen.update(open => !open);
  }
}
