/** @format */

import { Skill } from "./skill"; // Assuming Skill is defined in a separate file

/**
 * Интерфейс для группы навыков
 * Представляет категорию навыков с вложенным списком конкретных навыков
 */
export interface SkillsGroup {
  /** Уникальный идентификатор группы навыков */
  id: number;
  /** Название группы навыков (например, "Программирование", "Дизайн") */
  name: string;
  /** Массив навыков, входящих в данную группу */
  skills: Skill[];
}
