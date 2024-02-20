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

export type FeedItemType = "vacancy" | "news" | "project";

export type FeedItem =
  | ({ typeModel: FeedItemType } & {
      typeModel: "project";
      content: FeedProject;
    })
  | { typeModel: "vacancy"; content: Vacancy }
  | { typeModel: "news"; content: ProjectNews & { contentObject: { id: number } } };