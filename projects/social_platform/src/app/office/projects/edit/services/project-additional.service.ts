/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import {
  PartnerProgramFields,
  PartnerProgramFieldsValues,
  projectNewAdditionalProgramVields,
} from "@office/models/partner-program-fields.model";
import { ProgramService } from "@office/program/services/program.service";
import { ProjectService } from "@services/project.service";
import { Observable } from "rxjs";

/**
 * Сервис для управления дополнительными полями проекта в партнерской программе.
 * Предоставляет методы для инициализации формы, валидации, переключения значений,
 * подготовки к отправке и работы со статусами отправки и ошибок.
 */
@Injectable({ providedIn: "root" })
export class ProjectAdditionalService {
  private additionalForm!: FormGroup;
  private partnerProgramFields: PartnerProgramFields[] = [];
  private partnerProgramFieldsValues: PartnerProgramFieldsValues[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly programService = inject(ProgramService);

  private isSendingDecision = signal(false);
  private isAssignProjectToProgramError = signal(false);
  private errorAssignProjectToProgramModalMessage = signal<{ non_field_errors: string[] } | null>(
    null
  );

  constructor() {
    // Инициализируем пустую форму
    this.additionalForm = this.fb.group({});
  }

  /**
   * Возвращает форму дополнительных полей.
   */
  public getAdditionalForm(): FormGroup {
    return this.additionalForm;
  }

  /**
   * Возвращает массив описаний полей партнерской программы.
   */
  public getPartnerProgramFields(): PartnerProgramFields[] {
    return this.partnerProgramFields;
  }

  /**
   * Возвращает массив сохраненных значений полей.
   */
  public getPartnerProgramFieldsValues(): PartnerProgramFieldsValues[] {
    return this.partnerProgramFieldsValues;
  }

  /**
   * Возвращает сигнал, указывающий на процесс отправки.
   */
  public getIsSendingDecision() {
    return this.isSendingDecision;
  }

  /**
   * Возвращает сигнал, указывающий на ошибку при привязке к программе.
   */
  public getIsAssignProjectToProgramError() {
    return this.isAssignProjectToProgramError;
  }

  /**
   * Возвращает сообщение об ошибке привязки к программе.
   */
  public getErrorAssignProjectToProgramModalMessage() {
    return this.errorAssignProjectToProgramModalMessage;
  }

  /**
   * Инициализирует форму дополнительных полей согласно конфигурации и значениям.
   * @param fields описание полей партнерской программы
   * @param values сохраненные значения полей
   */
  public initializeAdditionalForm(
    fields: PartnerProgramFields[],
    values: PartnerProgramFieldsValues[] = []
  ): void {
    this.partnerProgramFields = fields;
    this.partnerProgramFieldsValues = values;

    // Создаем новую пустую форму
    this.additionalForm = this.fb.group({});

    // Добавляем контролы для каждого поля
    this.partnerProgramFields.forEach(field => {
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

  /**
   * Переключает значение для checkbox и radio полей.
   * @param fieldType тип поля (checkbox | radio и др.)
   * @param fieldName имя контрола в форме
   */
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

  /**
   * Проверяет обязательные поля на валидность и помечает их как touched.
   * @returns true если есть невалидные обязательные поля
   */
  public validateRequiredFields(): boolean {
    this.additionalForm.updateValueAndValidity();
    this.partnerProgramFields
      .filter(f => f.isRequired)
      .forEach(f => this.additionalForm.get(f.name)?.markAsTouched());

    return this.partnerProgramFields
      .filter(f => f.isRequired)
      .some(f => this.additionalForm.get(f.name)?.invalid);
  }

  /**
   * Убирает валидаторы с заполненных обязательных полей перед отправкой.
   */
  public prepareFieldsForSubmit(): void {
    this.partnerProgramFields
      .filter(f => f.isRequired)
      .forEach(f => {
        const ctrl = this.additionalForm.get(f.name);
        if (ctrl && ctrl.value) {
          ctrl.clearValidators();
          ctrl.updateValueAndValidity({ emitEvent: false });
        }
      });
  }

  /**
   * Отправляет значения дополнительных полей на сервер.
   * @param projectId идентификатор проекта
   * @returns Observable<any> результат запроса
   */
  public sendAdditionalFieldsValues(projectId: number): Observable<any> {
    const payload: projectNewAdditionalProgramVields[] = this.partnerProgramFields.map(field => ({
      field_id: field.id,
      value_text: String(this.additionalForm.get(field.name)?.value),
    }));

    this.isSendingDecision.set(true);
    return this.projectService.sendNewProjectFieldsValues(projectId, payload);
  }

  /**
   * Сабмитит проект привязанный к конкурсной программе
   * @param relationId идентификатор связи
   * @returns Observable<any> результат запроса
   */
  public submitCompettetiveProject(relationId: number): Observable<any> {
    return this.programService.submitCompettetiveProject(relationId);
  }

  /**
   * Сбрасывает флаг процесса отправки.
   */
  public resetSendingState(): void {
    this.isSendingDecision.set(false);
  }

  /**
   * Устанавливает сообщение и флаг ошибки при привязке проекта.
   * @param error объект с массивом полей non_field_errors
   */
  public setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.errorAssignProjectToProgramModalMessage.set(error);
    this.isAssignProjectToProgramError.set(true);
  }

  /**
   * Сбрасывает сообщение и флаг ошибки при привязке проекта.
   */
  public clearAssignProjectToProgramError(): void {
    this.errorAssignProjectToProgramModalMessage.set(null);
    this.isAssignProjectToProgramError.set(false);
  }

  /**
   * Вычисляет начальное значение контрола по сохраненным данным или типу поля.
   * @param field описание поля
   * @param values массив сохраненных значений
   * @returns первоначальное значение контрола
   */
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

  /**
   * Добавляет валидаторы по типу текстового поля.
   * @param field описание поля для обработки валидаторов
   */
  private addFieldTypeValidators(field: PartnerProgramFields): void {
    const control = this.additionalForm.get(field.name);
    if (!control) return;

    switch (field.fieldType) {
      case "text":
        control.addValidators([Validators.maxLength(50)]);
        break;
      case "textarea":
        control.addValidators([Validators.maxLength(100)]);
        break;
    }
  }
}
