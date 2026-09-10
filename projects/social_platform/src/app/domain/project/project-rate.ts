/** @format */

import { ProjectRatingCriterion } from "./project-rating-criterion"; // Assuming this is where ProjectRatingCriterion is declared

/** Интерфейс проекта для оценки */
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
  ratedExperts: number[];
  ratedCount: number;
  maxRates: number;
  criterias: ProjectRatingCriterion[];
}
