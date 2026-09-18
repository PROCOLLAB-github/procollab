/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ValidatorFn,
} from "@angular/forms";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { stripNullish } from "@utils/stripNull";
import { Project } from "@domain/project/project.model";
import {
  createProjectAchievementGroup,
  createProjectForm,
  projectRegionValidator,
} from "./project-form.factory";
import { ProjectFormAutosaveService } from "./project-form-autosave.service";
import { findCanonicalRussianRegion } from "@core/consts/lists/russian-regions-list.const";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject } from "rxjs";

const FILE_FIELDS = ["presentationAddress", "coverImageAddress"] as const;
/** Управляет основной формой проекта и формой дополнительных полей партнерской программы. */
@Injectable({ providedIn: "root" })
export class ProjectFormService {
  private projectForm!: FormGroup;
  private additionalForm!: FormGroup;
  private readonly projectId = signal<number | null>(null);
  readonly currentProjectId = this.projectId.asReadonly();
  /** null означает, что detail ещё не подтвердил вид обложки; удаление запрещено. */
  readonly isDefaultCover = signal<boolean | null>(null);
  private readonly contextChanged = new Subject<void>();
  readonly contextChanged$ = this.contextChanged.asObservable();
  /** Сохранение всей формы не должно вернуть прежний URL во время серверного сброса. */
  coverResetPending = false;
  private readonly fileHadValue = new Set<(typeof FILE_FIELDS)[number]>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectFormAutosaveService = inject(ProjectFormAutosaveService);

  public editIndex = signal<number | null>(null);
  public relationId = signal<number>(0);

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.projectForm = createProjectForm(this.fb);
    for (const field of FILE_FIELDS) {
      const control = this.projectForm.get(field)!;
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        if (typeof value === "string" && value.length > 0) this.fileHadValue.add(field);
      });
      this.projectFormAutosaveService.bindDraftCleanupAutosave(
        control,
        field,
        this.destroyRef,
        this.projectId,
      );
    }
  }

  /**
   * Устанавливает контекст именно Project, а не его связи с программой.
   * Заполнение файлов не является удалением: только эти контролы заполняются
   * без событий. История очистки сбрасывается при каждом новом наборе данных.
   */
  public initializeProjectData(project: Project): void {
    this.contextChanged.next();
    this.projectId.set(null);
    this.isDefaultCover.set(project.isDefaultCover ?? null);
    this.fileHadValue.clear();
    for (const field of FILE_FIELDS) {
      const value = project[field] ?? "";
      this.projectForm.get(field)!.setValue(value, { emitEvent: false });
      if (value) this.fileHadValue.add(field);
    }
    this.projectId.set(Number.isSafeInteger(project.id) && project.id > 0 ? project.id : null);
    const rawRegion = typeof project.region === "string" ? project.region.trim() : "";
    const canonicalRegion = findCanonicalRussianRegion(rawRegion);
    this.region?.setValidators([
      Validators.required,
      projectRegionValidator(canonicalRegion ? "" : rawRegion),
    ]);

    // Заполняем простые поля
    this.projectForm.patchValue({
      imageAddress: project.imageAddress,
      name: project.name,
      region: canonicalRegion ?? rawRegion,
      industryId: project.industry,
      description: project.description,
      implementationDeadline: project.implementationDeadline ?? null,
      targetAudience: project.targetAudience ?? null,
      actuality: project.actuality ?? "",
      trl: project.trl ?? "",
      problem: project.problem ?? "",
      partnerProgramId: project.partnerProgram?.programId ?? null,
    });
    this.region?.updateValueAndValidity({ emitEvent: false });

    if (project.partnerProgram) {
      this.relationId.set(project.partnerProgram?.programLinkId);
    }

    this.populateLinksFormArray(project.links || []);
    this.populateAchievementsFormArray(project.achievements || []);
  }

  private populateLinksFormArray(links: string[]): void {
    const linksFormArray = this.projectForm.get("links") as FormArray;

    while (linksFormArray.length !== 0) {
      linksFormArray.removeAt(0);
    }

    links.forEach(link => {
      linksFormArray.push(this.fb.nonNullable.control(link, [Validators.required]));
    });
  }

  private populateAchievementsFormArray(achievements: any[]): void {
    const achievementsFormArray = this.projectForm.get("achievements") as FormArray;
    const currentYear = new Date().getFullYear();

    while (achievementsFormArray.length !== 0) {
      achievementsFormArray.removeAt(0);
    }

    achievements.forEach((achievement, index) => {
      const achievementGroup = createProjectAchievementGroup(
        this.fb,
        achievement,
        index,
        currentYear,
      );
      achievementsFormArray.push(achievementGroup);
    });
  }

  public getForm(): FormGroup {
    return this.projectForm;
  }

  public patchFormValues(values: Partial<Project>): void {
    this.projectForm.patchValue(values);
  }

  public validateForm(): boolean {
    return this.projectForm.valid;
  }

  /**
   * Оставляет прежнюю очистку обычных полей, но сохраняет явное удаление файла.
   * Учитывается и файл, загруженный уже после открытия формы. Изначально пустой
   * нетронутый control не становится командой очистки; dirty для этого недостаточно,
   * поскольку программное обновление через CVA и patchValue имеет разную семантику.
   */
  public getFormValue(): any {
    const payload = stripNullish(this.projectForm.value);
    for (const field of FILE_FIELDS) {
      if (this.fileHadValue.has(field) && this.projectForm.get(field)?.value === "") {
        payload[field] = "";
      }
    }
    return payload;
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

  public clearAllValidationErrors(): void {
    Object.keys(this.projectForm.controls).forEach(ctrl => {
      this.projectForm.get(ctrl)?.setErrors(null);
    });
    this.clearAchievementsErrors(this.achievements);
  }

  public initializeAdditionalForm(partnerProgramFields: PartnerProgramFields[]): void {
    this.additionalForm = this.fb.group({});
    partnerProgramFields.forEach(field => {
      const validators: ValidatorFn[] = [];
      if (field.isRequired) validators.push(Validators.required);
      if (field.fieldType === "text") validators.push(Validators.maxLength(500));
      if (field.fieldType === "textarea") validators.push(Validators.maxLength(300));
      const initialValue = field.fieldType === "checkbox" ? false : "";
      const fieldCtrl = new FormControl(initialValue, validators);
      this.additionalForm.addControl(field.name, fieldCtrl);
    });
    this.additionalForm.updateValueAndValidity();
  }

  public getAdditionalForm(): FormGroup {
    return this.additionalForm;
  }

  public validateAdditionalForm(): boolean {
    return this.additionalForm?.valid ?? true;
  }

  public getAdditionalFormValue(): any {
    return this.additionalForm ? stripNullish(this.additionalForm.value) : {};
  }

  /** Сбрасывает контекст до контролов, чтобы сброс формы не сохранялся в прежний проект. */
  public resetForms(): void {
    this.contextChanged.next();
    this.projectId.set(null);
    this.isDefaultCover.set(null);
    this.fileHadValue.clear();
    this.projectForm.reset();
    this.additionalForm?.reset();
    this.clearFormArrays();
  }

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

  public validateAllForms(): boolean {
    const mainFormValid = this.validateForm();
    const additionalFormValid = this.validateAdditionalForm();

    return mainFormValid && additionalFormValid;
  }

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
