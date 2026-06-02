/**
 * Модели полей проекта-участника программы
 *
 * @format
 */

export class PartnerProgramFields {
  id!: number;
  name!: string;
  label!: string;
  fieldType!: "text" | "textarea" | "checkbox" | "select" | "radio" | "file";
  isRequired!: boolean;
  helpText!: string;
  options!: string[];
  showFilter?: boolean;
}

export class PartnerProgramFieldsValues {
  fieldName!: string;
  value!: string;
}

export class ProjectNewAdditionalProgramFields {
  fieldId!: number;
  valueText!: string | boolean;

  /**
   * Единая точка сборки DTO из доменного поля.
   * Резолв значения (форма / опции по умолчанию) остаётся за вызывающим —
   * это единственное, что реально отличается между флоу.
   */
  static fromField(
    field: PartnerProgramFields,
    value: string | boolean,
  ): ProjectNewAdditionalProgramFields {
    return { fieldId: field.id, valueText: value };
  }
}
