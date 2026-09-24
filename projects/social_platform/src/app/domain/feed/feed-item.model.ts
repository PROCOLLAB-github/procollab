/** @format */

import { FeedNews } from "../news/project-news.model";
import { Vacancy } from "../vacancy/vacancy.model";
import { ApiPagination } from "../other/api-pagination.model";

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
}

/** Тип элемента ленты */
export type FeedItemType = "vacancy" | "news" | "project";

/** Объединенный тип элемента ленты */
export type FeedItem =
  | ({ typeModel: FeedItemType; publishedAt?: string } & {
      typeModel: "project";
      content: FeedProject;
    })
  | { typeModel: "vacancy"; content: Vacancy; publishedAt?: string }
  | {
      typeModel: "news";
      content: FeedNews & { contentObject: { id: number; email?: string; industry?: number } };
      publishedAt?: string;
    };

/** Счётчики всех доступных категорий, независимо от выбранной страницы. */
export interface FeedCategoryCounts {
  all: number;
  project: number;
  vacancy: number;
  news: number;
  partnerprogram: number;
  education: number;
}

/** Страница ленты с метаданными категорий. */
export interface FeedPage extends ApiPagination<FeedItem> {
  counts?: FeedCategoryCounts;
}
