/**
 * Модель поля для полей проекта-участника программы
 * Содержит основную информацию о полях проекта, который учавствует в программе
 *
 * PartnerProgramFields содержит:
 * - Основную информацию (название, описание, типы для полей)
 *
 * PartnerProgramFieldsValues содержит:
 * - Основную информацию по значениям, которые содержатся в полях которые привязаны к программе(название и значение)
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
}

export class PartnerProgramFieldsValues {
  fieldName!: string;
  value!: string;
}

export class projectNewAdditionalProgramVields {
  field_id!: number;
  value_text!: string | boolean;
}
