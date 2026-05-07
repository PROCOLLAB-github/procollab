/** @format */

import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { FeedNews } from "../../project/project-news.model";

export abstract class ProgramNewsRepositoryPort {
  abstract fetchNews(
    limit: number,
    offset: number,
    programId: number
  ): Observable<ApiPagination<FeedNews>>;

  abstract readNews(programId: string, newsIds: number[]): Observable<void[]>;

  abstract toggleLike(programId: string, newsId: number, state: boolean): Observable<void>;

  abstract addNews(programId: number, obj: { text: string; files: string[] }): Observable<FeedNews>;

  abstract editNews(
    programId: number,
    newsId: number,
    newsItem: Partial<FeedNews>
  ): Observable<FeedNews>;

  abstract deleteNews(programId: number, newsId: number): Observable<void>;
}
