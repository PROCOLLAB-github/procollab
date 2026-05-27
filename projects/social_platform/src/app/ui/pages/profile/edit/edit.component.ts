/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { isLoading } from "@domain/shared/async-state";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { RouterModule } from "@angular/router";
import { EditorSubmitButtonDirective } from "./editor-submit-button.directive";
import { AsyncPipe, CommonModule } from "@angular/common";
import { Specialization } from "@domain/specializations/specialization.model";
import { SkillsGroupComponent } from "@ui/widgets/skills-group/skills-group.component";
import { SpecializationsGroupComponent } from "@ui/widgets/specializations-group/specializations-group.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { navProfileItems } from "@core/consts/navigation/nav-profile-items.const";
import { Skill } from "@domain/skills/skill.model";
import { ProfileFormService } from "@api/profile/facades/edit/profile-form.service";
import { ProjectStepService } from "@api/project/project-step.service";
import { ProfileEditInfoService } from "@api/profile/facades/edit/profile-edit-info.service";
import { OnboardingStageOneUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-stage-one-ui-info.service";
import { OnboardingStageOneInfoService } from "@api/onboarding/facades/stages/onboarding-stage-one-info.service";
import { ProjectVacancyUIService } from "@api/project/facades/edit/ui/project-vacancy-ui.service";
import { ProfileEditEducationInfoService } from "@api/profile/facades/edit/profile-edit-education-info.service";
import { ProfileEditExperienceInfoService } from "@api/profile/facades/edit/profile-edit-experience-info.service";
import { ProfileEditSkillsInfoService } from "@api/profile/facades/edit/profile-edit-skills-info.service";
import { ProjectNavigationComponent } from "@ui/pages/projects/edit/components/project-navigation/project-navigation.component";
import { ProfileMainStepComponent } from "./components/profile-main-step/profile-main-step.component";
import { ProfileEducationStepComponent } from "./components/profile-education-step/profile-education-step.component";
import { ProfileExperienceStepComponent } from "./components/profile-experience-step/profile-experience-step.component";
import { ProfileAchievementsStepComponent } from "./components/profile-achievements-step/profile-achievements-step.component";
import { ProfileSkillsStepComponent } from "./components/profile-skills-step/profile-skills-step.component";
import { OnboardingUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-ui-info.service";
import { ProjectsEditUIInfoService } from "@api/project/facades/edit/ui/projects-edit-ui-info.service";
import { ToggleFieldsInfoService } from "@api/toggle-fields/toggle-fields-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { SearchesService } from "@api/searches/searches.service";
import { EditStep } from "@core/lib/models/edit-step";
import { GetSpecializationsNestedUseCase } from "@api/specializations/use-cases/get-specializations-nested.use-case";
import { map } from "rxjs";

/** Многошаговая форма редактирования профиля пользователя. */
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
    ProjectVacancyUIService,
    ProjectsEditUIInfoService,
    ToggleFieldsInfoService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditInfoService = inject(ProfileEditInfoService);
  private readonly projectStepService = inject(ProjectStepService);
  private readonly getSpecializationsNestedUseCase = inject(GetSpecializationsNestedUseCase);
  private readonly searchesService = inject(SearchesService);
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly onboardingStageOneUIInfoService = inject(OnboardingStageOneUIInfoService);
  private readonly onboardingStageOneInfoService = inject(OnboardingStageOneInfoService);
  private readonly profileEditEducationInfoService = inject(ProfileEditEducationInfoService);
  private readonly profileEditExperienceInfoService = inject(ProfileEditExperienceInfoService);
  private readonly profileEditSkillsInfoService = inject(ProfileEditSkillsInfoService);

  protected readonly profileForm = this.profileFormService.getForm();

  ngOnInit(): void {
    this.profileEditInfoService.initializationEditInfo();
  }

  ngAfterViewInit() {
    this.profileFormService.initializeProfileData();
  }

  ngOnDestroy(): void {
    this.profileFormService.destroy();
  }

  readonly editingStep = this.projectStepService.currentStep;

  protected readonly profileId = this.profileEditInfoService.profileId;

  protected readonly AppRoutes = AppRoutes;

  protected readonly inlineSpecs = this.profileFormService.inlineSpecs;

  protected readonly nestedSpecs$ = this.getSpecializationsNestedUseCase
    .execute()
    .pipe(map(result => (result.ok ? result.value : [])));

  protected readonly specsGroupsModalOpen = signal(false);

  protected readonly inlineSkills = this.searchesService.inlineSkills;

  protected readonly nestedSkills$ = this.searchesService.getSkillsNested();

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

  navigateStep(step: EditStep) {
    this.projectStepService.navigateToStep(step);
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

  protected readonly profileFormSubmitting = computed(() =>
    isLoading(this.profileEditInfoService.profileFormSubmitting$())
  );

  // Для управления открытыми группами специализаций
  protected readonly openSpecializationGroup =
    this.onboardingStageOneUIInfoService.openSpecializationGroup;
  protected readonly hasOpenSpecializationsGroups =
    this.onboardingStageOneUIInfoService.hasOpenSpecializationsGroups;

  isSpecializationGroupDisabled(groupName: string): boolean {
    return this.onboardingStageOneUIInfoService.isSpecializationGroupDisabled(groupName);
  }

  onSpecializationsGroupToggled(isOpen: boolean, groupName: string): void {
    this.onboardingStageOneUIInfoService.onSpecializationsGroupToggled(isOpen, groupName);
  }

  saveProfile(): void {
    this.profileEditInfoService.saveProfile();
  }

  onSelectSpec(speciality: Specialization): void {
    this.onboardingStageOneInfoService.onSelectSpec(speciality);
  }

  onToggleSkill(toggledSkill: Skill): void {
    this.searchesService.onToggleSkill(toggledSkill, this.profileForm);
  }

  onAddSkill(newSkill: Skill): void {
    this.searchesService.onAddSkill(newSkill, this.profileForm);
  }

  onRemoveSkill(oddSkill: Skill): void {
    this.searchesService.onRemoveSkill(oddSkill, this.profileForm);
  }

  toggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }

  toggleSpecsGroupsModal(): void {
    this.specsGroupsModalOpen.update(open => !open);
  }
}
