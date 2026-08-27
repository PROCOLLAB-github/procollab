/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, ValidatorFn, Validators } from "@angular/forms";
import { rolesMembersList } from "@core/consts/lists/roles-members-list.const";
import { workExperienceList } from "@core/consts/lists/work-experience-list.const";
import { workFormatList } from "@core/consts/lists/work-format-list.const";
import { workScheduledList } from "@core/consts/lists/work-scheduled-list.const";
import { Skill } from "@domain/skills/skill.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { AsyncState, initial, isLoading } from "@domain/shared/async-state";
import { ProjectFormService } from "../project-form.service";
import { ValidationService } from "@corelib";
import { stripNullish } from "@utils/stripNull";
import { ProjectsEditUIInfoService } from "./projects-edit-ui-info.service";
import { ToggleFieldsInfoService } from "../../../../toggle-fields/toggle-fields-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

const REMOTE_WORK_FORMAT = "удаленная работа";
const CITY_REQUIRED_WORK_FORMATS = new Set(["работа в офисе", "смешанный формат"]);
const CITY_MAX_LENGTH = 255;
const trimmedRequired: ValidatorFn = control => {
  const value = typeof control.value === "string" ? control.value.trim() : "";
  return value.length ? null : { required: true };
};

/** UI-состояние вакансий проекта в форме редактирования. */
@Injectable()
export class ProjectVacancyUIService {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly validationService = inject(ValidationService);
  private readonly projectsEditUIInfoService = inject(ProjectsEditUIInfoService);
  private readonly toggleFieldsInfoService = inject(ToggleFieldsInfoService);

  public readonly workExperienceList = workExperienceList;
  public readonly workFormatList = workFormatList;
  public readonly workScheduledList = workScheduledList;
  public readonly rolesMembersList = rolesMembersList;

  public readonly selectedRequiredExperienceId = signal<number | undefined>(undefined);
  public readonly selectedWorkFormatId = signal<number | undefined>(undefined);
  public readonly selectedWorkScheduleId = signal<number | undefined>(undefined);
  public readonly selectedVacanciesSpecializationId = signal<number | undefined>(undefined);

  readonly selectedSkills = signal<Skill[]>([]);
  readonly skillsGroupsModalOpen = signal<boolean>(false);

  // Состояние отправки формы
  readonly vacancySubmitInitiated = signal(false);
  readonly vacancyIsSubmitting = signal<AsyncState<void>>(initial());
  readonly vacancyIsSubmittingFlag = computed(() => isLoading(this.vacancyIsSubmitting()));

  readonly vacancies = signal<Vacancy[]>([]);
  readonly onEditClicked = this.projectsEditUIInfoService.onEditClicked;

  readonly vacancyForm = this.fb.group({
    role: this.fb.control<string | null>(null),
    skills: this.fb.control<Skill[]>([]),
    description: this.fb.control<string | null>("", [Validators.maxLength(3500)]),
    requiredExperience: this.fb.control<string | null>(null),
    workFormat: this.fb.control<string | null>(null),
    city: this.fb.control<string | null>(null, [Validators.maxLength(CITY_MAX_LENGTH)]),
    salary: this.fb.control<string | null>(""),
    workSchedule: this.fb.control<string | null>(null),
    specialization: this.fb.control<string | null>(null),
  });

  constructor() {
    this.workFormat?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyCityValidation());
    this.applyCityValidation();
  }

  applySetVacancies(vacancies: Vacancy[]): void {
    this.vacancies.set(vacancies);
  }

  applyPatchFormValues(values: Parameters<typeof this.vacancyForm.patchValue>[0]): void {
    this.vacancyForm.patchValue(values);
    this.applyCityValidation();
  }

  applyValidateForm(): boolean {
    return !this.validationService.getFormValidation(this.vacancyForm);
  }

  isDirty(): boolean {
    return this.vacancyForm.dirty;
  }

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

  get city() {
    return this.vacancyForm.get("city");
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

  isCityRequired(): boolean {
    return CITY_REQUIRED_WORK_FORMATS.has(this.workFormat?.value ?? "");
  }

  private applyCityValidation(): void {
    const city = this.city;
    if (!city) return;

    if (this.isCityRequired()) {
      city.setValidators([trimmedRequired, Validators.maxLength(CITY_MAX_LENGTH)]);
    } else {
      city.setValidators([Validators.maxLength(CITY_MAX_LENGTH)]);
      if (this.workFormat?.value === REMOTE_WORK_FORMAT && city.value !== null) {
        city.setValue(null, { emitEvent: false });
      }
    }
    city.updateValueAndValidity({ emitEvent: false });
  }

  applyRemoveVacancy(vacancyId: number): void {
    this.vacancies.update(list => list.filter(v => v.id !== vacancyId));
  }

  applySubmitVacancy(vacancy: Vacancy): void {
    this.vacancies.update(list => [...list, vacancy]);
    this.applyResetVacancyForm();
  }

  applyUpdateVacancy(vacancy: Vacancy): void {
    this.vacancies.update(list => list.map(item => (item.id === vacancy.id ? vacancy : item)));
    this.applyResetVacancyForm();
  }

  applyEditVacancy(index: number): void {
    const item = this.vacancies()[index];
    if (!item) {
      return;
    }
    // Установка выбранных значений селектов по сопоставлению
    this.workExperienceList.find(e => e.value === item.requiredExperience) &&
      this.selectedRequiredExperienceId.set(
        this.workExperienceList.find(e => e.value === item.requiredExperience)!.id,
      );

    this.workFormatList.find(f => f.value === item.workFormat) &&
      this.selectedWorkFormatId.set(this.workFormatList.find(f => f.value === item.workFormat)!.id);

    this.workScheduledList.find(s => s.value === item.workSchedule) &&
      this.selectedWorkScheduleId.set(
        this.workScheduledList.find(s => s.value === item.workSchedule)!.id,
      );

    this.rolesMembersList.find(r => r.value === item.specialization) &&
      this.selectedVacanciesSpecializationId.set(
        this.rolesMembersList.find(r => r.value === item.specialization)!.id,
      );

    // Патчинг формы значениями вакансии
    this.applyPatchFormValues({
      role: item.role,
      skills: item.requiredSkills,
      description: item.description,
      requiredExperience: item.requiredExperience,
      workFormat: item.workFormat,
      city: item.city ?? null,
      salary: item.salary ?? null,
      workSchedule: item.workSchedule,
      specialization: item.specialization,
    });
    this.projectFormService.editIndex.set(index);
    this.onEditClicked.set(true);
    this.toggleFieldsInfoService.showFields();
  }

  applyResetVacancyForm(): void {
    this.vacancyForm.reset();
    Object.keys(this.vacancyForm.controls).forEach(name => {
      const ctrl = this.vacancyForm.get(name);
      ctrl?.reset(name === "skills" ? [] : name === "city" ? null : "");
      ctrl?.clearValidators();
      ctrl?.markAsPristine();
      ctrl?.updateValueAndValidity();
    });
    this.selectedRequiredExperienceId.set(undefined);
    this.selectedWorkFormatId.set(undefined);
    this.selectedWorkScheduleId.set(undefined);
    this.selectedVacanciesSpecializationId.set(undefined);
    this.projectFormService.editIndex.set(null);
    this.onEditClicked.set(false);
    this.vacancyIsSubmitting.set(initial());
    this.applyCityValidation();
  }
}
