/** @format */

import { Vacancy } from "@domain/vacancy/vacancy.model";
import { Collaborator } from "./collaborator.model";

/**
 * Краткая сводка по проекту, используемая при отображении приглашений
 */
export interface InviteProjectSummary {
  inviteId: number;
  id: number;
  imageAddress?: string | null;
  vacancies: Vacancy[];
  collaborators: Collaborator[];
  name: string;
  shortDescription: string;
  industry?: number | null;
}
