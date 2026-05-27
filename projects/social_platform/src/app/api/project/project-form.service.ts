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
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { stripNullish } from "@utils/stripNull";
import { Project } from "@domain/project/project.model";
import { optionalUrlOrMentionValidator } from "@utils/optionalUrl.validator";
/** Управляет основной формой проекта и формой дополнительных полей партнерской программы. */
@Injectable({ providedIn: "root" })
export class ProjectFormService {
  private projectForm!: FormGroup;
  private additionalForm!: FormGroup;
  private readonly fb = inject(FormBuilder);

  public editIndex = signal<number | null>(null);
  public relationId = signal<number>(0);

  constructor() {
    this.initializeForm();
  }

  formModel = (this.projectForm = this.fb.group({
    imageAddress: [""],
    name: ["", [Validators.required, Validators.maxLength(256)]],
    region: ["", [Validators.required, Validators.maxLength(256)]],
    implementationDeadline: [null],
    trl: [null],
    links: this.fb.array([]),
    link: ["", optionalUrlOrMentionValidator],
    industryId: [undefined],
    description: ["", [Validators.maxLength(800)]],
    presentationAddress: [""],
    coverImageAddress: [""],
    actuality: ["", [Validators.maxLength(1000)]],
    targetAudience: ["", [Validators.maxLength(500)]],
    problem: ["", [Validators.maxLength(1000)]],
    partnerProgramId: [null],
    achievements: this.fb.array([]),
    title: [""],
    status: [""],

    draft: [null],
  }));

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      imageAddress: [""],
      name: ["", [Validators.required, Validators.maxLength(256)]],
      region: ["", [Validators.required, Validators.maxLength(256)]],
      implementationDeadline: [null],
      trl: [null],
      links: this.fb.array([]),
      link: ["", optionalUrlOrMentionValidator],
      industryId: [undefined],
      description: ["", [Validators.maxLength(800)]],
      presentationAddress: [""],
      coverImageAddress: [""],
      actuality: ["", [Validators.maxLength(1000)]],
      targetAudience: ["", [Validators.maxLength(500)]],
      problem: ["", [Validators.maxLength(400)]],
      partnerProgramId: [null],
      achievements: this.fb.array([]),
      title: [""],
      status: [""],

      draft: [null],
    });
  }

  public initializeProjectData(project: Project): void {
    // Заполняем простые поля
    this.projectForm.patchValue({
      imageAddress: project.imageAddress,
      name: project.name,
      region: project.region,
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
      linksFormArray.push(this.fb.control(link, optionalUrlOrMentionValidator));
    });
  }

  private populateAchievementsFormArray(achievements: any[]): void {
    const achievementsFormArray = this.projectForm.get("achievements") as FormArray;
    const currentYear = new Date().getFullYear();

    while (achievementsFormArray.length !== 0) {
      achievementsFormArray.removeAt(0);
    }

    achievements.forEach((achievement, index) => {
      const achievementGroup = this.fb.group({
        id: achievement.id ?? index,
        title: [achievement.title || "", Validators.required],
        status: [
          achievement.status || "",
          [
            Validators.required,
            Validators.min(2000),
            Validators.max(currentYear),
            Validators.pattern(/^\d{4}$/),
          ],
        ],
      });
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

  public getFormValue(): any {
    const value = stripNullish(this.projectForm.value);

    if (Array.isArray(value["links"])) {
      value["links"] = value["links"].map((v: string) => v?.trim()).filter((v: string) => !!v);
    }

    return value;
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

  public get achievementsName(): FormArray {
    return this.projectForm.get("achievementsName") as FormArray;
  }

  public get achievementsDate(): FormArray {
    return this.projectForm.get("achievementsDate") as FormArray;
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
      if (field.fieldType === "textarea") validators.push(Validators.maxLength(500));
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

  public resetForms(): void {
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
