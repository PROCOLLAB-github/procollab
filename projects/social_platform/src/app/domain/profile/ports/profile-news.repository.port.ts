/** @format */

import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { ProfileNews } from "../profile-news.model";

export abstract class ProfileNewsRepositoryPort {
  abstract fetchNews(id: number): Observable<ApiPagination<ProfileNews>>;
  abstract fetchNewsDetail(userId: string, newsId: string): Observable<ProfileNews>;
  abstract addNews(userId: string, obj: { text: string; files: string[] }): Observable<ProfileNews>;
  abstract readNews(userId: number, newsIds: number[]): Observable<void[]>;
  abstract delete(userId: string, newsId: number): Observable<void>;
  abstract toggleLike(userId: string, newsId: number, state: boolean): Observable<void>;
  abstract editNews(
    userId: string,
    newsId: number,
    newsItem: Partial<ProfileNews>
  ): Observable<ProfileNews>;
}
