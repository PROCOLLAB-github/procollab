/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { forkJoin, map, Observable, of, tap } from "rxjs";
import { StorageService } from "../../../api/storage/storage.service";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ProfileNews } from "../../../domain/profile/profile-news.model";
import { ProfileNewsHttpAdapter } from "../../adapters/profile/profile-news-http.adapter";

@Injectable({ providedIn: "root" })
export class ProfileNewsRepository {
  private readonly profileNewsAdapter = inject(ProfileNewsHttpAdapter);
  private readonly storageService = inject(StorageService);

  fetchNews(id: string): Observable<ApiPagination<ProfileNews>> {
    return this.profileNewsAdapter
      .fetchNews(id)
      .pipe(map(page => ({ ...page, results: plainToInstance(ProfileNews, page.results) })));
  }

  fetchNewsDetail(userId: string, newsId: string): Observable<ProfileNews> {
    return this.profileNewsAdapter
      .fetchNewsDetail(userId, newsId)
      .pipe(map(news => plainToInstance(ProfileNews, news)));
  }

  addNews(userId: string, obj: { text: string; files: string[] }): Observable<ProfileNews> {
    return this.profileNewsAdapter
      .addNews(userId, obj)
      .pipe(map(news => plainToInstance(ProfileNews, news)));
  }

  readNews(userId: number, newsIds: number[]): Observable<void[]> {
    const cachedReadNews = this.storageService.getItem<number[]>("readNews", sessionStorage) ?? [];
    const readNews = new Set<number>(cachedReadNews);
    const unreadIds = newsIds.filter(id => !readNews.has(id));

    if (unreadIds.length === 0) {
      return of([]);
    }

    return forkJoin(
      unreadIds.map(id =>
        this.profileNewsAdapter.setNewsViewed(userId, id).pipe(
          tap(() => {
            readNews.add(id);
            this.storageService.setItem("readNews", [...readNews], sessionStorage);
          })
        )
      )
    );
  }

  delete(userId: string, newsId: number): Observable<void> {
    return this.profileNewsAdapter.deleteNews(userId, newsId);
  }

  toggleLike(userId: string, newsId: number, state: boolean): Observable<void> {
    return this.profileNewsAdapter.toggleLike(userId, newsId, state);
  }

  editNews(
    userId: string,
    newsId: number,
    newsItem: Partial<ProfileNews>
  ): Observable<ProfileNews> {
    return this.profileNewsAdapter
      .editNews(userId, newsId, newsItem)
      .pipe(map(news => plainToInstance(ProfileNews, news)));
  }
}
