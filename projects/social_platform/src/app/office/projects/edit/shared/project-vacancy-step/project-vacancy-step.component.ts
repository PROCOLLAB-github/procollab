/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputComponent, ButtonComponent, SelectComponent } from "@ui/components";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@error/models/error-message";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SkillsBasketComponent } from "@office/shared/skills-basket/skills-basket.component";
import { VacancyCardComponent } from "@office/features/vacancy-card/vacancy-card.component";
import { Skill } from "@office/models/skill";
import { ProjectVacancyService } from "../../services/project-vacancy.service";
import { ActivatedRoute } from "@angular/router";
import { IconComponent } from "@uilib";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";

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
  ],
})
export class ProjectVacancyStepComponent implements OnInit {
  @Input() inlineSkills: Skill[] = [];

  @Output() searchSkill = new EventEmitter<string>();
  @Output() addSkill = new EventEmitter<Skill>();
  @Output() removeSkill = new EventEmitter<Skill>();
  @Output() toggleSkillsGroupsModal = new EventEmitter<void>();

  private readonly projectVacancyService = inject(ProjectVacancyService);
  private readonly route = inject(ActivatedRoute);

  readonly errorMessage = ErrorMessage;
  showFields = false;

  ngOnInit(): void {
    this.projectVacancyService.setVacancies(this.vacancies);
  }

  // Геттеры для формы
  get vacancyForm(): FormGroup {
    return this.projectVacancyService.getVacancyForm();
  }

  get role() {
    return this.projectVacancyService.role;
  }

  get description() {
    return this.projectVacancyService.description;
  }

  get requiredExperience() {
    return this.projectVacancyService.requiredExperience;
  }

  get workFormat() {
    return this.projectVacancyService.workFormat;
  }

  get salary() {
    return this.projectVacancyService.salary;
  }

  get workSchedule() {
    return this.projectVacancyService.workSchedule;
  }

  get skills() {
    return this.projectVacancyService.skills;
  }

  get specialization() {
    return this.projectVacancyService.specialization;
  }

  // Геттеры для данных
  get vacancies() {
    return this.projectVacancyService.getVacancies();
  }

  get experienceList() {
    return this.projectVacancyService.experienceList;
  }

  get formatList() {
    return this.projectVacancyService.formatList;
  }

  get scheludeList() {
    return this.projectVacancyService.scheludeList;
  }

  get rolesMembersList() {
    return this.projectVacancyService.rolesMembersList;
  }

  get selectedRequiredExperienceId() {
    return this.projectVacancyService.selectedRequiredExperienceId;
  }

  get selectedWorkFormatId() {
    return this.projectVacancyService.selectedWorkFormatId;
  }

  get selectedWorkScheduleId() {
    return this.projectVacancyService.selectedWorkScheduleId;
  }

  get selectedVacanciesSpecializationId() {
    return this.projectVacancyService.selectedVacanciesSpecializationId;
  }

  get vacancySubmitInitiated() {
    return this.projectVacancyService.vacancySubmitInitiated;
  }

  get vacancyIsSubmitting() {
    return this.projectVacancyService.vacancyIsSubmitting;
  }

  /**
   *
   */
  createVacancyBlock(): void {
    this.showFields = true;
  }

  /**
   * Отправка формы вакансии
   */
  submitVacancy(): void {
    const projectId = Number(this.route.snapshot.paramMap.get("projectId"));
    this.projectVacancyService.submitVacancy(projectId);
  }

  /**
   * Удаление вакансии
   */
  removeVacancy(vacancyId: number): void {
    this.projectVacancyService.removeVacancy(vacancyId);
  }

  /**
   * Редактирование вакансии
   */
  editVacancy(index: number): void {
    this.projectVacancyService.editVacancy(index);
  }

  /**
   * Обработчики событий для навыков
   */
  onSearchSkill(query: string): void {
    this.searchSkill.emit(query);
  }

  onAddSkill(skill: Skill): void {
    this.projectVacancyService.onAddSkill(skill);
    this.addSkill.emit(skill);
  }

  onRemoveSkill(skill: Skill): void {
    this.projectVacancyService.onRemoveSkill(skill);
    this.removeSkill.emit(skill);
  }

  onToggleSkillsGroupsModal(): void {
    this.toggleSkillsGroupsModal.emit();
  }
}
