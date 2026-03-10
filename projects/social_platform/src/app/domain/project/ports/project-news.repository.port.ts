/** @format */

import { Observable } from "rxjs";
import { FeedNews } from "../project-news.model";
import { ApiPagination } from "../../other/api-pagination.model";

export abstract class ProjectNewsRepositoryPort {
  abstract fetchNews(projectId: string): Observable<ApiPagination<FeedNews>>;

  abstract fetchNewsDetail(projectId: string, newsId: string): Observable<FeedNews>;

  abstract addNews(projectId: string, obj: { text: string; files: string[] }): Observable<FeedNews>;

  abstract readNews(projectId: number, newsIds: number[]): Observable<void[]>;

  abstract delete(projectId: string, newsId: number): Observable<void>;

  abstract toggleLike(projectId: string, newsId: number, state: boolean): Observable<void>;

  abstract editNews(
    projectId: string,
    newsId: number,
    newsItem: Partial<FeedNews>
  ): Observable<FeedNews>;
}
