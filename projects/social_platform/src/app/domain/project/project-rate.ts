/** @format */

import { User } from "@domain/auth/user.model";
import type { ProgramFieldAnswer } from "./program-link-fields.model";
import { ProjectRatingCriterion } from "./project-rating-criterion";

/** Интерфейс проекта для оценки */
export interface ProjectRate {
  managedEvaluation?: boolean;
  criteriaRevision?: string;
  canRate?: boolean;
  blockedReason?: string | null;
  programLinkId?: number;
  programFields?: ProgramFieldAnswer[];
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
  scoredExpertId?: number | null;
  ratedExperts: (number | User)[];
  ratedCount: number;
  maxRates: number;
  criterias: ProjectRatingCriterion[];
}
