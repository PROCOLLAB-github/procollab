/** @format */

/**
 * Интерфейс критерия оценки проекта
 *
 * Описывает структуру критерия, по которому оценивается проект в рамках программы.
 * Критерий может быть разных типов (boolean, integer, string) с различными ограничениями.
 *
 * Свойства:
 * @param {number} id - Уникальный идентификатор критерия
 * @param {string} name - Название критерия оценки
 * @param {string} description - Подробное описание критерия
 * @param {ProjectRatingCriterionType} type - Тип критерия ("bool" | "int" | "str")
 * @param {number | null} minValue - Минимальное значение (для числовых критериев)
 * @param {number | null} maxValue - Максимальное значение (для числовых критериев)
 * @param {string | number} value - Текущее значение критерия
 */
import { ProjectRatingCriterionType } from "./project-rating-criterion-type";

export interface ProjectRatingCriterion {
  id: number;
  name: string;
  description: string;
  type: ProjectRatingCriterionType;
  minValue: number | null;
  maxValue: number | null;
  value: string | number;
}
