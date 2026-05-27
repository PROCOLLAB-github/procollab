/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import {
  PartnerProgramFields,
  PartnerProgramFieldsValues,
  ProjectNewAdditionalProgramFields,
} from "@domain/program/partner-program-fields.model";
import { Observable } from "rxjs";
import { SendProjectAdditionalFieldsUseCase } from "../../use-cases/send-project-additional-fields.use-case";
import { SubmitCompetitiveProjectUseCase } from "../../use-cases/submit-competitive-project.use-case";
import { AsyncState, failure, initial, loading, success } from "@domain/shared/async-state";

/** Сервис дополнительных полей проекта в партнерской программе. */
@Injectable()
export class ProjectAdditionalService {
  private additionalForm!: FormGroup;
  readonly partnerProgramFields = signal<PartnerProgramFields[]>([]);
  private partnerProgramFieldsValues: PartnerProgramFieldsValues[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly sendProjectAdditionalFieldsUseCase = inject(SendProjectAdditionalFieldsUseCase);
  private readonly submitCompetitiveProjectUseCase = inject(SubmitCompetitiveProjectUseCase);

  readonly isSend$ = signal<AsyncState<void>>(initial());

  readonly errorAssignProjectToProgramModalMessage = signal<{ non_field_errors: string[] } | null>(
    null
  );

  constructor() {
    // Инициализируем пустую форму
    this.additionalForm = this.fb.group({});
  }

  public getAdditionalForm(): FormGroup {
    return this.additionalForm;
  }

  public getPartnerProgramFieldsValues(): PartnerProgramFieldsValues[] {
    return this.partnerProgramFieldsValues;
  }

  public initializeAdditionalForm(
    fields: PartnerProgramFields[],
    values: PartnerProgramFieldsValues[] = []
  ): void {
    this.partnerProgramFields.set(fields);
    this.partnerProgramFieldsValues = values;

    // Создаем новую пустую форму
    this.additionalForm = this.fb.group({});

    // Добавляем контролы для каждого поля
    this.partnerProgramFields().forEach(field => {
      this.getInitialValue(field, values);
      const validators = field.isRequired ? [Validators.required] : [];
      const initialValue = this.getInitialValue(field, values);

      this.additionalForm.addControl(field.name, new FormControl(initialValue, validators));

      // Добавляем дополнительную валидацию по типу поля
      this.addFieldTypeValidators(field);
    });

    // Применяем валидацию ко всей форме
    this.additionalForm.updateValueAndValidity();
  }

  public toggleAdditionalFormValues(
    fieldType: "text" | "textarea" | "checkbox" | "select" | "radio" | "file",
    fieldName: string
  ): void {
    if (fieldType === "checkbox" || fieldType === "radio") {
      const control = this.additionalForm.get(fieldName);
      if (control) {
        control.setValue(!control.value);
      }
    }
  }

  public validateRequiredFields(): boolean {
    this.additionalForm.updateValueAndValidity();
    this.partnerProgramFields()
      .filter(f => f.isRequired)
      .forEach(f => this.additionalForm.get(f.name)?.markAsTouched());

    return this.partnerProgramFields()
      .filter(f => f.isRequired)
      .some(f => this.additionalForm.get(f.name)?.invalid);
  }

  public prepareFieldsForSubmit(): void {
    this.partnerProgramFields()
      .filter(f => f.isRequired)
      .forEach(f => {
        const ctrl = this.additionalForm.get(f.name);
        if (ctrl && ctrl.value) {
          ctrl.clearValidators();
          ctrl.updateValueAndValidity({ emitEvent: false });
        }
      });
  }

  public sendAdditionalFieldsValues(projectId: number): Observable<any> {
    this.isSend$.set(loading());
    const newFieldsFormValues: ProjectNewAdditionalProgramFields[] = [];

    this.partnerProgramFields().forEach((field: PartnerProgramFields) => {
      const fieldValue = this.additionalForm.get(field.name)?.value;
      newFieldsFormValues.push(
        ProjectNewAdditionalProgramFields.fromField(field, String(fieldValue))
      );
    });

    return this.sendProjectAdditionalFieldsUseCase.execute(projectId, newFieldsFormValues);
  }

  public submitCompettetiveProject(relationId: number): Observable<any> {
    return this.submitCompetitiveProjectUseCase.execute(relationId);
  }

  public resetSendingState(): void {
    this.isSend$.set(initial());
  }

  public setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.errorAssignProjectToProgramModalMessage.set(error);
    this.isSend$.set(failure("assign_error"));
  }

  public clearAssignProjectToProgramError(): void {
    this.errorAssignProjectToProgramModalMessage.set(null);
    this.isSend$.set(initial());
  }

  private getInitialValue(field: PartnerProgramFields, values: PartnerProgramFieldsValues[]): any {
    const saved = values.find(v => v.fieldName === field.name);
    if (!saved) {
      return field.fieldType === "checkbox" || field.fieldType === "radio" ? false : "";
    }

    const text = saved.value.trim().toLowerCase();
    if (field.fieldType === "checkbox" || field.fieldType === "radio") {
      return text === "true";
    }
    return saved.value;
  }

  private addFieldTypeValidators(field: PartnerProgramFields): void {
    const control = this.additionalForm.get(field.name);
    if (!control) return;

    switch (field.fieldType) {
      case "text":
        control.addValidators([Validators.maxLength(500)]);
        break;
      case "textarea":
        control.addValidators([Validators.maxLength(300)]);
        break;
    }
  }
}
