/** @format */

import { Specialization } from "./specialization";

/**
 * Модель группы специализаций
 * Представляет категорию специализаций с вложенным списком
 *
 * Содержит:
 * - Название группы специализаций
 * - Массив специализаций в данной группе
 */
export interface SpecializationsGroup {
  id: number;
  name: string;
  specializations: Specialization[];
}
