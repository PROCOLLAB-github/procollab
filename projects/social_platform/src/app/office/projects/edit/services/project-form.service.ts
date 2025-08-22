/** @format */

import { inject, Injectable, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ValidatorFn,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";
import { Project } from "@office/models/project.model";
import { ProjectService } from "@office/services/project.service";
import { stripNullish } from "@utils/stripNull";
import { concatMap, filter } from "rxjs";

/**
 * Сервис для управления основной формой проекта и формой дополнительных полей партнерской программы.
 * Обеспечивает создание, инициализацию, валидацию, автосохранение, сброс и получение данных форм.
 */
@Injectable({ providedIn: "root" })
export class ProjectFormService {
  private projectForm!: FormGroup;
  private additionalForm!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  public editIndex = signal<number | null>(null);
  public relationId = signal<number>(0);

  constructor() {
    this.initializeForm();
  }

  /**
   * Создает и настраивает основную форму проекта с набором контролов и валидаторов.
   * Подписывается на изменения полей 'presentationAddress' и 'coverImageAddress' для автосохранения при очищении.
   */
  private initializeForm(): void {
    this.projectForm = this.fb.group({
      imageAddress: [""],
      name: ["", [Validators.required]],
      region: ["", [Validators.required]],
      step: [null, [Validators.required]],
      implementationDeadline: [null],
      trl: [null],
      links: this.fb.array([]),
      link: ["", Validators.pattern(/^(https?:\/\/)/)],
      industryId: [undefined, [Validators.required]],
      description: ["", [Validators.required]],
      presentationAddress: ["", [Validators.required]],
      coverImageAddress: ["", [Validators.required]],
      actuality: ["", [Validators.max(1000)]],
      targetAudience: ["", [Validators.required, Validators.max(500)]],
      problem: ["", [Validators.required, Validators.max(1000)]],
      partnerProgramId: [null],
      achievements: this.fb.array([]),
      achievementsName: [""],
      achievementsPrize: [""],
      draft: [null],
    });

    // Автосохранение при очистке presentationAddress
    this.presentationAddress?.valueChanges
      .pipe(
        filter(value => !value),
        concatMap(() =>
          this.projectService.updateProject(Number(this.route.snapshot.params["projectId"]), {
            presentationAddress: "",
            draft: true,
          })
        )
      )
      .subscribe();

    // Автосохранение при очистке coverImageAddress
    this.coverImageAddress?.valueChanges
      .pipe(
        filter(value => !value),
        concatMap(() =>
          this.projectService.updateProject(Number(this.route.snapshot.params["projectId"]), {
            coverImageAddress: "",
            draft: true,
          })
        )
      )
      .subscribe();
  }

  /**
   * Заполняет основную форму данными существующего проекта.
   * @param project экземпляр Project с текущими данными
   */
  public initializeProjectData(project: Project): void {
    // Заполняем простые поля
    this.projectForm.patchValue({
      imageAddress: project.imageAddress,
      name: project.name,
      region: project.region,
      step: project.step,
      industryId: project.industry,
      description: project.description,
      implementationDeadline: project.implementationDeadline ?? null,
      targetAudience: project.targetAudience ?? null,
      actuality: project.actuality ?? "",
      trl: project.trl ?? "",
      problem: project.problem ?? "",
      presentationAddress: project.presentationAddress,
      coverImageAddress: project.coverImageAddress,
      partnerProgramId: project.partnerProgram?.programId ?? null,
    });

    console.log(project.partnerProgram?.programId);

    if (project.partnerProgram) {
      this.relationId.set(project.partnerProgram?.programLinkId);
    }

    this.populateLinksFormArray(project.links || []);

    this.populateAchievementsFormArray(project.achievements || []);
  }

  /**
   * Заполняет FormArray ссылок данными из проекта
   * @param links массив ссылок из проекта
   */
  private populateLinksFormArray(links: string[]): void {
    const linksFormArray = this.projectForm.get("links") as FormArray;

    // Очищаем существующие контролы
    while (linksFormArray.length !== 0) {
      linksFormArray.removeAt(0);
    }

    // Добавляем новые контролы
    links.forEach(link => {
      linksFormArray.push(this.fb.control(link));
    });
  }

  /**
   * Заполняет FormArray достижений данными из проекта
   * @param achievements массив достижений из проекта
   */
  private populateAchievementsFormArray(achievements: any[]): void {
    const achievementsFormArray = this.projectForm.get("achievements") as FormArray;

    // Очищаем существующие контролы
    while (achievementsFormArray.length !== 0) {
      achievementsFormArray.removeAt(0);
    }

    // Добавляем новые контролы
    achievements.forEach((achievement, index) => {
      const achievementGroup = this.fb.group({
        id: achievement.id ?? index,
        title: achievement.title || "",
        status: achievement.status || "",
      });
      achievementsFormArray.push(achievementGroup);
    });
  }

  /**
   * Возвращает основную форму проекта.
   * @returns FormGroup экземпляр формы проекта
   */
  public getForm(): FormGroup {
    return this.projectForm;
  }

  /**
   * Патчит частичные значения в основную форму.
   * @param values объект с частичными значениями Project
   */
  public patchFormValues(values: Partial<Project>): void {
    this.projectForm.patchValue(values);
  }

  /**
   * Проверяет валидность основной формы проекта.
   * @returns true если все контролы валидны
   */
  public validateForm(): boolean {
    return this.projectForm.valid;
  }

  /**
   * Получает текущее значение формы без null или undefined.
   * @returns объект значений формы без nullish
   */
  public getFormValue(): any {
    return stripNullish(this.projectForm.value);
  }

  // Геттеры для быстрого доступа к контролам основной формы
  public get name() {
    return this.projectForm.get("name");
  }

  public get region() {
    return this.projectForm.get("region");
  }

  public get industry() {
    return this.projectForm.get("industryId");
  }

  public get step() {
    return this.projectForm.get("step");
  }

  public get description() {
    return this.projectForm.get("description");
  }

  public get actuality() {
    return this.projectForm.get("actuality");
  }

  public get implementationDeadline() {
    return this.projectForm.get("implementationDeadline");
  }

  public get problem() {
    return this.projectForm.get("problem");
  }

  public get targetAudience() {
    return this.projectForm.get("targetAudience");
  }

  public get trl() {
    return this.projectForm.get("trl");
  }

  public get presentationAddress() {
    return this.projectForm.get("presentationAddress");
  }

  public get coverImageAddress() {
    return this.projectForm.get("coverImageAddress");
  }

  public get imageAddress() {
    return this.projectForm.get("imageAddress");
  }

  public get partnerProgramId() {
    return this.projectForm.get("partnerProgramId");
  }

  public get achievements(): FormArray {
    return this.projectForm.get("achievements") as FormArray;
  }

  public get links(): FormArray {
    return this.projectForm.get("links") as FormArray;
  }

  /**
   * Очищает все ошибки валидации в основной форме и в массиве достижений.
   */
  public clearAllValidationErrors(): void {
    Object.keys(this.projectForm.controls).forEach(ctrl => {
      this.projectForm.get(ctrl)?.setErrors(null);
    });
    this.clearAchievementsErrors(this.achievements);
  }

  /**
   * Инициализирует форму дополнительных полей программы партнерства.
   * @param partnerProgramFields массив метаданных полей
   */
  public initializeAdditionalForm(partnerProgramFields: PartnerProgramFields[]): void {
    this.additionalForm = this.fb.group({});
    partnerProgramFields.forEach(field => {
      const validators: ValidatorFn[] = [];
      if (field.isRequired) validators.push(Validators.required);
      if (field.fieldType === "text") validators.push(Validators.maxLength(50));
      if (field.fieldType === "textarea") validators.push(Validators.maxLength(100));
      const initialValue = field.fieldType === "checkbox" ? false : "";
      const fieldCtrl = new FormControl(initialValue, validators);
      this.additionalForm.addControl(field.name, fieldCtrl);
    });
    this.additionalForm.updateValueAndValidity();
  }

  /**
   * Возвращает форму дополнительных полей.
   * @returns FormGroup экземпляр дополнительной формы
   */
  public getAdditionalForm(): FormGroup {
    return this.additionalForm;
  }

  /**
   * Проверяет валидность дополнительной формы.
   * @returns true если форма инициализирована и валидна
   */
  public validateAdditionalForm(): boolean {
    return this.additionalForm?.valid ?? true;
  }

  /**
   * Возвращает очищенные значения дополнительной формы.
   * @returns объект значений без nullish
   */
  public getAdditionalFormValue(): any {
    return this.additionalForm ? stripNullish(this.additionalForm.value) : {};
  }

  /**
   * Сбрасывает основную и дополнительную формы в первоначальное состояние.
   */
  public resetForms(): void {
    this.projectForm.reset();
    this.additionalForm?.reset();

    // Очищаем FormArray
    this.clearFormArrays();
  }

  /**
   * Очищает все FormArray в форме
   */
  private clearFormArrays(): void {
    const linksArray = this.links;
    const achievementsArray = this.achievements;

    while (linksArray.length !== 0) {
      linksArray.removeAt(0);
    }

    while (achievementsArray.length !== 0) {
      achievementsArray.removeAt(0);
    }
  }

  /**
   * Проверяет валидность обеих форм (основной и дополнительной).
   * @returns true если обе формы валидны
   */
  public validateAllForms(): boolean {
    return this.validateForm() && this.validateAdditionalForm();
  }

  /**
   * Удаляет ошибки валидации внутри массива достижений.
   * @param achievements FormArray достижений
   */
  private clearAchievementsErrors(achievements: FormArray): void {
    achievements.controls.forEach(group => {
      if (group instanceof FormGroup) {
        Object.keys(group.controls).forEach(name => {
          group.get(name)?.setErrors(null);
        });
      }
    });
  }
}
