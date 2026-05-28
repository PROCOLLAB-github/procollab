/** @format */

import { Program } from "../program/program.model";
import { FeedNews } from "../news/project-news.model";
import { Vacancy } from "../vacancy/vacancy.model";

/** Модели данных для элементов ленты */
/** Интерфейс проекта в ленте */
export interface FeedProject {
  id: number;
  name: string;
  shortDescription: string;
  industry: number;
  imageAddress: string;
  viewsCount: number;
  leader: number;
  partnerProgram: {
    id: Program["id"];
    name: Program["name"];
  } | null;
}

/** Тип элемента ленты */
export type FeedItemType = "vacancy" | "news" | "project" | "partnerprogram";

/** Объединенный тип элемента ленты */
export type FeedItem =
  | ({ typeModel: FeedItemType } & {
      typeModel: "project";
      content: FeedProject;
    })
  | { typeModel: "vacancy"; content: Vacancy }
  | { typeModel: "news"; content: FeedNews & { contentObject: { id: number } } };
