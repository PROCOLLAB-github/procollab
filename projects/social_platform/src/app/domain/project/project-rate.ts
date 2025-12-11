/** @format */

import { User } from "projects/ui/src/lib/models/user.model";
import { ProjectRatingCriterion } from "./project-rating-criterion"; // Assuming this is where ProjectRatingCriterion is declared

/**
 * Интерфейс проекта для оценки
 *
 * Представляет проект, который может быть оценен экспертами в рамках программы.
 * Содержит информацию о проекте и критерии для его оценки.
 *
 * Свойства:
 * @param {number} id - Уникальный идентификатор проекта
 * @param {string} name - Название проекта
 * @param {number} leader - ID руководителя проекта
 * @param {string} description - Описание проекта
 * @param {string} imageAddress - URL изображения проекта
 * @param {string} presentationAddress - URL презентации проекта
 * @param {string} region - Регион проекта
 * @param {number} viewsCount - Количество просмотров
 * @param {number} industry - ID отрасли проекта
 * @param {ProjectRatingCriterion[]} criterias - Массив критериев для оценки
 * @param {boolean} isScored - Флаг, указывающий, оценен ли проект текущим пользователем
 * @private {number | null} scoredExpertId - Флаг, что оценил
 */
export interface ProjectRate {
  id: number;
  name: string;
  leader: number;
  description: string;
  imageAddress: string;
  presentationAddress: string;
  region: string;
  viewsCount: number;
  industry: number;
  scored: boolean;
  scoredExpertId: number | null;
  ratedExperts: User[];
  ratedCount: number;
  maxRates: number;
  criterias: ProjectRatingCriterion[];
}
