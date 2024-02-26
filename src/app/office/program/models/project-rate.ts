/** @format */

import { ProjectRatingCriterion } from "@office/shared/project-rating/models";

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
