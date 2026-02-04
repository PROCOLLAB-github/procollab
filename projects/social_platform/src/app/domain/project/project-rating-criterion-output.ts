/** @format */

/**
 * Интерфейс для отправки оценки критерия проекта
 *
 * Используется при отправке оценок проекта на сервер.
 * Содержит ID критерия и значение оценки в унифицированном формате.
 *
 * @param {number} criterionId - ID критерия оценки
 * @param {unknown} value - Значение оценки (может быть string, number, boolean)
 */
export interface ProjectRatingCriterionOutput {
  criterionId: number;
  value: unknown;
}
