/** @format */

import { ProjectRatingCriterion } from "./project-rating-criterion";

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
  criterias: ProjectRatingCriterion[];
  isScored: boolean;
}
