/** @format */
import { ProjectNews } from "@office/projects/models/project-news.model";
import { Vacancy } from "@models/vacancy.model";

export interface FeedProject {
  id: number;
  name: string;
  shortDescription: string;
  industry: number;
  imageAddress: string;
  viewsCount: number;
  leader: number;
}

export type FeedItem =
  | ({ type: string } & {
      type: "project";
      content: FeedProject;
    })
  | { type: "vacancy"; content: Vacancy }
  | { type: "news"; content: ProjectNews };
