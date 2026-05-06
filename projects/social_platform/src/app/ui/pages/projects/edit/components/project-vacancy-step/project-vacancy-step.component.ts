/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { InputComponent, ButtonComponent, SelectComponent } from "@ui/primitives";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { AutoCompleteInputComponent } from "@ui/primitives/autocomplete-input/autocomplete-input.component";
import { SkillsBasketComponent } from "@ui/widgets/skills-basket/skills-basket.component";
import { VacancyCardComponent } from "@ui/widgets/vacancy-card/vacancy-card.component";
import { IconComponent } from "@uilib";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { Skill } from "@domain/skills/skill";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { SkillsGroupComponent } from "@ui/widgets/skills-group/skills-group.component";
import { ProjectVacancyUIService } from "@api/project/facades/edit/ui/project-vacancy-ui.service";
import { SkillsInfoService } from "@api/skills/facades/skills-info.service";
import { ToggleFieldsInfoService } from "@api/toggle-fields/toggle-fields-info.service";
import { ProjectVacancyService } from "@api/project/facades/edit/project-vacancy.service";

@Component({
  selector: "app-project-vacancy-step",
  templateUrl: "./project-vacancy-step.component.html",
  styleUrl: "./project-vacancy-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    IconComponent,
    ControlErrorPipe,
    SelectComponent,
    AutoCompleteInputComponent,
    SkillsBasketComponent,
    VacancyCardComponent,
    TextareaComponent,
    ModalComponent,
    SkillsGroupComponent,
  ],
  providers: [ProjectsEditInfoService, ProjectVacancyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectVacancyStepComponent implements OnInit {
  private readonly projectVacancyInfoService = inject(ProjectVacancyService);
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);
  private readonly skillsInfoService = inject(SkillsInfoService);
  private readonly toggleFieldsInfoService = inject(ToggleFieldsInfoService);

  ngOnInit(): void {
    this.projectVacancyUIService.applySetVacancies(this.vacancies());
  }

  // Геттеры для формы
  protected readonly vacancyForm = this.projectVacancyUIService.vacancyForm;

  protected readonly role = this.projectVacancyUIService.role;
  protected readonly description = this.projectVacancyUIService.description;
  protected readonly requiredExperience = this.projectVacancyUIService.requiredExperience;
  protected readonly workFormat = this.projectVacancyUIService.workFormat;
  protected readonly salary = this.projectVacancyUIService.salary;
  protected readonly workSchedule = this.projectVacancyUIService.workSchedule;
  protected readonly skills = this.projectVacancyUIService.skills;
  protected readonly specialization = this.projectVacancyUIService.specialization;

  // Геттеры для данных
  protected readonly vacancies = this.projectVacancyUIService.vacancies;

  protected readonly experienceList = this.projectVacancyUIService.workExperienceList;
  protected readonly formatList = this.projectVacancyUIService.workFormatList;
  protected readonly scheludeList = this.projectVacancyUIService.workScheludeList;
  protected readonly rolesMembersList = this.projectVacancyUIService.rolesMembersList;

  protected readonly selectedRequiredExperienceId =
    this.projectVacancyUIService.selectedRequiredExperienceId;

  protected readonly selectedWorkFormatId = this.projectVacancyUIService.selectedWorkFormatId;
  protected readonly selectedWorkScheduleId = this.projectVacancyUIService.selectedWorkScheduleId;
  protected readonly selectedVacanciesSpecializationId =
    this.projectVacancyUIService.selectedVacanciesSpecializationId;

  protected readonly vacancySubmitInitiated = this.projectVacancyUIService.vacancySubmitInitiated;
  protected readonly vacancyIsSubmitting = this.projectVacancyUIService.vacancyIsSubmittingFlag;

  protected readonly inlineSkills = this.projectsEditInfoService.inlineSkills;
  protected readonly projectId = this.projectsEditInfoService.profileId;
  protected readonly showInputFields = this.toggleFieldsInfoService.showInputFields;

  // Сигналы для управления состоянием
  protected readonly nestedSkills$ = this.projectsEditInfoService.nestedSkills$;
  protected readonly skillsGroupsModalOpen = this.projectVacancyUIService.skillsGroupsModalOpen;

  protected readonly hasOpenSkillsGroups = this.projectsEditInfoService.hasOpenSkillsGroups;
  protected readonly openGroupIds = this.projectsEditInfoService.openGroupIds;

  protected readonly errorMessage = ErrorMessage;

  /**
   * Отображение блока вакансий
   */
  createVacancyBlock(): void {
    this.toggleFieldsInfoService.showFields();
  }

  /**
   * Отправка формы вакансии
   */
  submitVacancy(): void {
    this.projectVacancyInfoService.submitVacancy(this.projectId());
  }

  /**
   * Удаление вакансии
   */
  removeVacancy(vacancyId: number): void {
    this.projectVacancyInfoService.removeVacancy(vacancyId);
  }

  /**
   * Редактирование вакансии
   */
  editVacancy(index: number): void {
    this.projectVacancyUIService.applyEditVacancy(index);
  }

  /**
   * Добавление навыка
   * @param newSkill - новый навык
   */
  onAddSkill(newSkill: Skill): void {
    this.skillsInfoService.onAddSkill(newSkill, this.vacancyForm);
  }

  /**
   * Удаление навыка
   * @param oddSkill - навык для удаления
   */
  onRemoveSkill(oddSkill: Skill): void {
    this.skillsInfoService.onRemoveSkill(oddSkill, this.vacancyForm);
  }

  /**
   * Переключение навыка в списке выбранных
   * @param toggledSkill - навык для переключения
   */
  onToggleSkill(toggledSkill: Skill): void {
    this.skillsInfoService.onToggleSkill(toggledSkill, this.vacancyForm);
  }

  /**
   * Поиск навыков
   * @param query - поисковый запрос
   */
  onSearchSkill(query: string): void {
    this.projectsEditInfoService.onSearchSkill(query);
  }

  /**
   * Переключение модального окна групп навыков
   */
  onToggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }

  onGroupToggled(isOpen: boolean, skillsGroupId: number): void {
    this.projectsEditInfoService.onGroupToggled(isOpen, skillsGroupId);
  }
}
