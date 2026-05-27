/** @format */

import type { Specialization } from "./specialization.model";

/** Модель группы специализаций */
export interface SpecializationsGroup {
  id: number;
  name: string;
  specializations: Specialization[];
}
