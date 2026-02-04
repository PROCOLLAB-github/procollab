/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { rolesMembersList } from "projects/core/src/consts/lists/roles-members-list.const";
import { workExperienceList } from "projects/core/src/consts/lists/work-experience-list.const";
import { workFormatList } from "projects/core/src/consts/lists/work-format-list.const";
import { workScheludeList } from "projects/core/src/consts/lists/work-schelude-list.const";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";
import { ProjectFormService } from "../project-form.service";
import { ValidationService } from "@corelib";
import { stripNullish } from "@utils/helpers/stripNull";

@Injectable({ providedIn: "root" })
export class ProjectVacancyUIService {
  private readonly fb = inject(FormBuilder);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly validationService = inject(ValidationService);

  /** Константы для выпадающих списков */
  public readonly workExperienceList = workExperienceList;
  public readonly workFormatList = workFormatList;
  public readonly workScheludeList = workScheludeList;
  public readonly rolesMembersList = rolesMembersList;

  /** Сигналы для выбранных значений селектов */
  public readonly selectedRequiredExperienceId = signal<number | undefined>(undefined);
  public readonly selectedWorkFormatId = signal<number | undefined>(undefined);
  public readonly selectedWorkScheduleId = signal<number | undefined>(undefined);
  public readonly selectedVacanciesSpecializationId = signal<number | undefined>(undefined);

  readonly selectedSkills = signal<Skill[]>([]);
  readonly skillsGroupsModalOpen = signal<boolean>(false);

  // Состояние отправки формы
  readonly vacancySubmitInitiated = signal(false);
  readonly vacancyIsSubmitting = signal(false);

  readonly vacancies = signal<Vacancy[]>([]);
  readonly onEditClicked = signal<boolean>(false);

  readonly vacancyForm = this.fb.group({
    role: this.fb.control<string | null>(null),
    skills: this.fb.control<Skill[]>([]),
    description: [this.fb.control<string | null>(""), Validators.maxLength(3500)],
    requiredExperience: this.fb.control<string | null>(null),
    workFormat: this.fb.control<string | null>(null),
    salary: this.fb.control<string | null>(""),
    workSchedule: this.fb.control<string | null>(null),
    specialization: this.fb.control<string | null>(null),
  });

  /**
   * Устанавливает список вакансий.
   * @param vacancies массив объектов Vacancy
   */
  applySetVacancies(vacancies: Vacancy[]): void {
    this.vacancies.set(vacancies);
  }

  /**
   * Проставляет значения в форму вакансии.
   * @param values частичные поля Vacancy для патчинга
   */
  applyPatchFormValues(values: Partial<Vacancy>): void {
    this.vacancyForm.patchValue(values);
  }

  /**
   * Проверяет валидность формы вакансии.
   * @returns true если форма валидна
   */
  applyValidateForm(): boolean {
    return !this.validationService.getFormValidation(this.vacancyForm);
  }

  /**
   * Проверяет на "грязность" формы вакансии.
   * @returns true если "грязная" форма
   */
  isDirty(): boolean {
    return this.vacancyForm.dirty;
  }

  /**
   * Возвращает очищенные от nullish значения формы.
   * @returns объект значений формы без null и undefined
   */
  getFormValue(): any {
    return stripNullish(this.vacancyForm.value);
  }

  // Геттеры для быстрого доступа к контролам формы
  get role() {
    return this.vacancyForm.get("role");
  }

  get skills() {
    return this.vacancyForm.get("skills");
  }

  get description() {
    return this.vacancyForm.get("description");
  }

  get requiredExperience() {
    return this.vacancyForm.get("requiredExperience");
  }

  get workFormat() {
    return this.vacancyForm.get("workFormat");
  }

  get salary() {
    return this.vacancyForm.get("salary");
  }

  get workSchedule() {
    return this.vacancyForm.get("workSchedule");
  }

  get specialization() {
    return this.vacancyForm.get("specialization");
  }

  applyRemoveVacancy(vacancyId: number): void {
    this.vacancies.update(list => list.filter(v => v.id !== vacancyId));
  }

  applySubmitVacancy(vacancy: Vacancy): void {
    this.vacancies.update(list => [...list, vacancy]);
    this.applyResetVacancyForm();
  }

  /**
   * Инициализирует редактирование вакансии по индексу в массиве:
   * заполняет форму, выставляет сигналы и переключает режим редактирования.
   * @param index индекс вакансии в списке vacancies
   */
  applyEditVacancy(index: number): void {
    const item = this.vacancies()[index];
    // Установка выбранных значений селектов по сопоставлению
    this.workExperienceList.find(e => e.value === item.requiredExperience) &&
      this.selectedRequiredExperienceId.set(
        this.workExperienceList.find(e => e.value === item.requiredExperience)!.id
      );

    this.workFormatList.find(f => f.value === item.workFormat) &&
      this.selectedWorkFormatId.set(this.workFormatList.find(f => f.value === item.workFormat)!.id);

    this.workScheludeList.find(s => s.value === item.workSchedule) &&
      this.selectedWorkScheduleId.set(
        this.workScheludeList.find(s => s.value === item.workSchedule)!.id
      );

    this.rolesMembersList.find(r => r.value === item.specialization) &&
      this.selectedVacanciesSpecializationId.set(
        this.rolesMembersList.find(r => r.value === item.specialization)!.id
      );

    // Патчинг формы значениями вакансии
    this.vacancyForm.patchValue({
      role: item.role,
      skills: item.requiredSkills,
      description: item.description,
      requiredExperience: item.requiredExperience,
      workFormat: item.workFormat,
      salary: item.salary ?? null,
      workSchedule: item.workSchedule,
      specialization: item.specialization,
    });
    this.projectFormService.editIndex.set(index);
    this.onEditClicked.set(true);
  }

  /**
   * Сбрасывает форму вакансии к начальному состоянию:
   * очищает значения, валидаторы и состояния контролов,
   * сбрасывает сигналы выбранных селектов.
   */
  applyResetVacancyForm(): void {
    this.vacancyForm.reset();
    Object.keys(this.vacancyForm.controls).forEach(name => {
      const ctrl = this.vacancyForm.get(name);
      ctrl?.reset(name === "skills" ? [] : "");
      ctrl?.clearValidators();
      ctrl?.markAsPristine();
      ctrl?.updateValueAndValidity();
    });
    this.selectedRequiredExperienceId.set(undefined);
    this.selectedWorkFormatId.set(undefined);
    this.selectedWorkScheduleId.set(undefined);
    this.selectedVacanciesSpecializationId.set(undefined);
    this.vacancyIsSubmitting.set(false);
  }
}
