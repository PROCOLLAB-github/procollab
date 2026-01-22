/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ValidationService } from "@corelib";
import { Skill } from "@office/models/skill";
import { Vacancy } from "@office/models/vacancy.model";
import { VacancyService } from "@office/services/vacancy.service";
import { stripNullish } from "@utils/stripNull";
import { rolesMembersList } from "projects/core/src/consts/lists/roles-members-list.const";
import { ProjectFormService } from "./project-form.service";
import { workExperienceList } from "projects/core/src/consts/lists/work-experience-list.const";
import { workFormatList } from "projects/core/src/consts/lists/work-format-list.const";
import { workScheludeList } from "projects/core/src/consts/lists/work-schelude-list.const";

/**
 * Сервис для управления вакансиями проекта.
 * Обеспечивает создание, валидацию, отправку,
 * редактирование и удаление вакансий, а также работу с формой вакансии
 * и синхронизацию с API.
 */
@Injectable({ providedIn: "root" })
export class ProjectVacancyService {
  /** Форма для создания и редактирования вакансии */
  private vacancyForm!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
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

  // Состояние отправки формы
  readonly vacancySubmitInitiated = signal(false);
  readonly vacancyIsSubmitting = signal(false);

  public vacancies = signal<Vacancy[]>([]);
  public onEditClicked = signal<boolean>(false);

  constructor() {
    this.initializeVacancyForm();
  }

  /**
   * Инициализирует форму вакансии с необходимыми контролами и без валидаторов.
   */
  private initializeVacancyForm(): void {
    this.vacancyForm = this.fb.group({
      role: [null],
      skills: [[]],
      description: ["", [Validators.maxLength(3500)]],
      requiredExperience: [null],
      workFormat: [null],
      salary: [""],
      workSchedule: [null],
      specialization: [null],
    });
  }

  /**
   * Возвращает форму вакансии.
   * @returns FormGroup экземпляр формы вакансии
   */
  public getVacancyForm(): FormGroup {
    return this.vacancyForm;
  }

  /**
   * Устанавливает список вакансий.
   * @param vacancies массив объектов Vacancy
   */
  public setVacancies(vacancies: Vacancy[]): void {
    this.vacancies.set(vacancies);
  }

  /**
   * Возвращает текущий список вакансий.
   * @returns Vacancy[] массив вакансий
   */
  public getVacancies(): Vacancy[] {
    return this.vacancies();
  }

  /**
   * Проставляет значения в форму вакансии.
   * @param values частичные поля Vacancy для патчинга
   */
  public patchFormValues(values: Partial<Vacancy>): void {
    this.vacancyForm.patchValue(values);
  }

  /**
   * Проверяет валидность формы вакансии.
   * @returns true если форма валидна
   */
  public validateForm(): boolean {
    return this.vacancyForm.valid;
  }

  /**
   * Возвращает очищенные от nullish значения формы.
   * @returns объект значений формы без null и undefined
   */
  public getFormValue(): any {
    return stripNullish(this.vacancyForm.value);
  }

  // Геттеры для быстрого доступа к контролам формы
  public get role() {
    return this.vacancyForm.get("role");
  }

  public get skills() {
    return this.vacancyForm.get("skills");
  }

  public get description() {
    return this.vacancyForm.get("description");
  }

  public get requiredExperience() {
    return this.vacancyForm.get("requiredExperience");
  }

  public get workFormat() {
    return this.vacancyForm.get("workFormat");
  }

  public get salary() {
    return this.vacancyForm.get("salary");
  }

  public get workSchedule() {
    return this.vacancyForm.get("workSchedule");
  }

  public get specialization() {
    return this.vacancyForm.get("specialization");
  }

  /**
   * Отправляет форму вакансии: настраивает валидаторы, проверяет форму,
   * создаёт вакансию через API и сбрасывает форму.
   * @returns Promise<boolean> - true при успехе, false при ошибке валидации или API
   */
  public submitVacancy(projectId: number) {
    // Настройка валидаторов для обязательных полей
    this.vacancyForm.get("role")?.setValidators([Validators.required]);
    this.vacancyForm.get("skills")?.setValidators([Validators.required]);
    this.vacancyForm.get("requiredExperience")?.setValidators([Validators.required]);
    this.vacancyForm.get("workFormat")?.setValidators([Validators.required]);
    this.vacancyForm.get("workSchedule")?.setValidators([Validators.required]);
    this.vacancyForm
      .get("salary")
      ?.setValidators([Validators.pattern("^(\\d{1,3}( \\d{3})*|\\d+)$")]);

    // Обновление валидности и отображение ошибок
    Object.keys(this.vacancyForm.controls).forEach(name => {
      const ctrl = this.vacancyForm.get(name);
      ctrl?.updateValueAndValidity();
      if (["role", "skills"].includes(name)) ctrl?.markAsTouched();
    });

    this.vacancySubmitInitiated.set(true);

    // Проверка валидации формы
    if (!this.validationService.getFormValidation(this.vacancyForm)) {
      return;
    }

    // Подготовка payload для API
    this.vacancyIsSubmitting.set(true);

    const vacancy = this.vacancyForm.value;
    const payload = {
      ...vacancy,
      requiredSkillsIds: vacancy.skills.map((s: Skill) => s.id),
      salary: typeof vacancy.salary === "string" ? +vacancy.salary : null,
    };

    // Вызов API для создания вакансии
    this.vacancyService.postVacancy(projectId, payload).subscribe({
      next: vacancy => {
        this.vacancies.update(list => [...list, vacancy]);
        this.resetVacancyForm();
      },
      error: () => {
        this.vacancyIsSubmitting.set(false);
      },
    });
  }

  /**
   * Сбрасывает форму вакансии к начальному состоянию:
   * очищает значения, валидаторы и состояния контролов,
   * сбрасывает сигналы выбранных селектов.
   */
  private resetVacancyForm(): void {
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

  /**
   * Удаляет вакансию по её идентификатору с подтверждением пользователя.
   * @param vacancyId идентификатор вакансии для удаления
   */
  public removeVacancy(vacancyId: number): void {
    if (!confirm("Вы точно хотите удалить вакансию?")) return;
    this.vacancyService.deleteVacancy(vacancyId).subscribe(() => {
      this.vacancies.update(list => list.filter(v => v.id !== vacancyId));
    });
  }

  /**
   * Инициализирует редактирование вакансии по индексу в массиве:
   * заполняет форму, выставляет сигналы и переключает режим редактирования.
   * @param index индекс вакансии в списке vacancies
   */
  public editVacancy(index: number): void {
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
   * Добавляет навык к списку requiredSkills, если его там нет.
   * @param newSkill объект Skill для добавления
   */
  public onAddSkill(newSkill: Skill): void {
    const skills: Skill[] = this.vacancyForm.value.skills;
    if (!skills.some(s => s.id === newSkill.id)) {
      this.vacancyForm.patchValue({ skills: [newSkill, ...skills] });
    }
  }

  /**
   * Удаляет навык из списка requiredSkills.
   * @param oldSkill объект Skill для удаления
   */
  public onRemoveSkill(oldSkill: Skill): void {
    const skills: Skill[] = this.vacancyForm.value.skills;
    this.vacancyForm.patchValue({
      skills: skills.filter(s => s.id !== oldSkill.id),
    });
  }
}
