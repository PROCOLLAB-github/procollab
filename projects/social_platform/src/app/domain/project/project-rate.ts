/** @format */

import { User } from "@domain/auth/user.model";
import { ProjectRatingCriterion } from "./project-rating-criterion"; // Assuming this is where ProjectRatingCriterion is declared

/** Интерфейс проекта для оценки */
export interface ProjectRate {
  managedEvaluation?: boolean;
  criteriaRevision?: string;
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
