/** @format */

import { CommonModule } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  InputComponent,
  ButtonComponent,
  SelectComponent,
  TextareaComponent,
} from "@ui/primitives";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { AutoCompleteInputComponent } from "@ui/primitives/autocomplete-input/autocomplete-input.component";
import { SkillsBasketComponent } from "@ui/widgets/skills-basket/skills-basket.component";
import { VacancyCardComponent } from "@ui/widgets/vacancy-card/vacancy-card.component";
import { IconComponent } from "@uilib";
import { Skill } from "@domain/skills/skill.model";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { SkillsGroupComponent } from "@ui/widgets/skills-group/skills-group.component";
import { ProjectVacancyUIService } from "@api/project/facades/edit/ui/project-vacancy-ui.service";
import { ToggleFieldsInfoService } from "@api/toggle-fields/toggle-fields-info.service";
import { ProjectVacancyService } from "@api/project/facades/edit/project-vacancy.service";
import { SearchesService } from "@api/searches/searches.service";
import { VacancyCreatedDialogComponent } from "@ui/widgets/vacancy-created-dialog/vacancy-created-dialog.component";
import { isFailure } from "@domain/shared/async-state";

/** Шаг редактирования проекта: вакансии. */
@Component({
  selector: "app-project-vacancy-step",
  templateUrl: "./project-vacancy-step.component.html",
  styleUrl: "./project-vacancy-step.component.scss",
  imports: [
    VacancyCreatedDialogComponent,
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    IconComponent,
    ControlErrorPipe,
    SelectComponent,
    TextareaComponent,
    AutoCompleteInputComponent,
    SkillsBasketComponent,
    VacancyCardComponent,
    ModalComponent,
    SkillsGroupComponent,
  ],
  // Подсказки вакансии не разделяются с формами профиля и участниками проекта.
  providers: [SearchesService, ProjectsEditInfoService, ProjectVacancyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectVacancyStepComponent {
  private readonly injector = inject(Injector);
  private readonly skillSearch = viewChild(AutoCompleteInputComponent);
  private readonly vacancySubmitButton = viewChild<unknown, ElementRef<HTMLElement>>(
    "vacancySubmitButton",
    { read: ElementRef },
  );
  private readonly projectVacancyInfoService = inject(ProjectVacancyService);
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);
  private readonly searchesService = inject(SearchesService);
  private readonly toggleFieldsInfoService = inject(ToggleFieldsInfoService);

  // Геттеры для формы
  protected readonly vacancyForm = this.projectVacancyUIService.vacancyForm;

  protected readonly role = this.projectVacancyUIService.role;
  protected readonly description = this.projectVacancyUIService.description;
  protected readonly requiredExperience = this.projectVacancyUIService.requiredExperience;
  protected readonly workFormat = this.projectVacancyUIService.workFormat;
  protected readonly city = this.projectVacancyUIService.city;
  protected readonly salary = this.projectVacancyUIService.salary;
  protected readonly workSchedule = this.projectVacancyUIService.workSchedule;
  protected readonly skills = this.projectVacancyUIService.skills;
  protected readonly specialization = this.projectVacancyUIService.specialization;

  // Геттеры для данных
  protected readonly vacancies = this.projectVacancyUIService.vacancies;

  protected readonly experienceList = this.projectVacancyUIService.workExperienceList;
  protected readonly formatList = this.projectVacancyUIService.workFormatList;
  protected readonly scheludeList = this.projectVacancyUIService.workScheduledList;
  protected readonly rolesMembersList = this.projectVacancyUIService.rolesMembersList;

  protected readonly selectedRequiredExperienceId =
    this.projectVacancyUIService.selectedRequiredExperienceId;

  protected readonly selectedWorkFormatId = this.projectVacancyUIService.selectedWorkFormatId;
  protected readonly selectedWorkScheduleId = this.projectVacancyUIService.selectedWorkScheduleId;
  protected readonly selectedVacanciesSpecializationId =
    this.projectVacancyUIService.selectedVacanciesSpecializationId;

  protected readonly vacancySubmitInitiated = this.projectVacancyUIService.vacancySubmitInitiated;
  protected readonly vacancyIsSubmitting = this.projectVacancyUIService.vacancyIsSubmittingFlag;
  protected readonly createdVacancyId = this.projectVacancyUIService.createdVacancyId;
  protected readonly isEditing = this.projectVacancyUIService.isEditingVacancy;
  protected readonly vacancySubmitFailed = computed(() =>
    isFailure(this.projectVacancyUIService.vacancyIsSubmitting()),
  );

  protected readonly inlineSkills = this.searchesService.inlineSkills;
  protected readonly projectId = this.projectsEditInfoService.profileId;
  protected readonly showInputFields = this.toggleFieldsInfoService.showInputFields;

  // Сигналы для управления состоянием
  protected readonly nestedSkills$ = this.projectsEditInfoService.nestedSkills$;
  protected readonly skillsGroupsModalOpen = this.projectVacancyUIService.skillsGroupsModalOpen;

  protected readonly hasOpenSkillsGroups = this.projectsEditInfoService.hasOpenSkillsGroups;
  protected readonly openGroupIds = this.projectsEditInfoService.openGroupIds;

  protected readonly errorMessage = ErrorMessage;

  protected isCityVisible(): boolean {
    return this.projectVacancyUIService.isCityRequired();
  }

  createVacancyBlock(): void {
    this.resetSkillSearch();
    this.toggleFieldsInfoService.showFields();
  }

  submitVacancy(): void {
    this.resetSkillSearch();
    this.projectVacancyInfoService.submitVacancy(this.projectId());
  }

  closeCreatedDialog(): void {
    this.createdVacancyId.set(null);
    // Disabling submit during the request can blur it before the dialog opens.
    afterNextRender(
      () => {
        this.vacancySubmitButton()
          ?.nativeElement.querySelector<HTMLButtonElement>("button")
          ?.focus();
      },
      { injector: this.injector },
    );
  }

  removeVacancy(vacancyId: number): void {
    this.projectVacancyInfoService.removeVacancy(vacancyId);
  }

  editVacancy(index: number): void {
    this.resetSkillSearch();
    this.projectVacancyUIService.applyEditVacancy(index);
  }

  onAddSkill(newSkill: Skill): void {
    this.searchesService.onAddSkill(newSkill, this.vacancyForm);
  }

  onRemoveSkill(oddSkill: Skill): void {
    this.searchesService.onRemoveSkill(oddSkill, this.vacancyForm);
  }

  onToggleSkill(toggledSkill: Skill): void {
    this.searchesService.onToggleSkill(toggledSkill, this.vacancyForm);
  }

  onSearchSkill(query: string): void {
    this.searchesService.onSearchSkill(query);
  }

  cancelSkillSearch(): void {
    this.searchesService.onSearchSkill("");
  }

  private resetSkillSearch(): void {
    this.skillSearch()?.resetSearch();
    this.cancelSkillSearch();
  }

  onToggleSkillsGroupsModal(): void {
    this.resetSkillSearch();
    this.skillsGroupsModalOpen.update(open => !open);
  }

  closeSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.set(false);
  }

  onGroupToggled(isOpen: boolean, skillsGroupId: number): void {
    this.projectsEditInfoService.onGroupToggled(isOpen, skillsGroupId);
  }
}
