/** @format */

import type { Skill } from "./skill.model";

/** Интерфейс группы навыков */
export interface SkillsGroup {
  /** Уникальный идентификатор группы навыков */
  id: number;
  /** Название группы навыков (например, "Программирование", "Дизайн") */
  name: string;
  /** Массив навыков, входящих в данную группу */
  skills: Skill[];
}
