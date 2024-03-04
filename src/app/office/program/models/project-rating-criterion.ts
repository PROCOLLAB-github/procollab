/** @format */

import { ProjectRatingCriterionType } from "./project-rating-criterion-type";

export interface ProjectRatingCriterion {
  id: number;
  name: string;
  description: string;
  type: ProjectRatingCriterionType;
  minValue: number | null;
  maxValue: number | null;
  value: string | number;
}
