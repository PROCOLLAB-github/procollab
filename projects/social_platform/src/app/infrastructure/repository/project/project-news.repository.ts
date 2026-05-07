/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { forkJoin, map, Observable, of, tap } from "rxjs";
import { StorageService } from "@api/storage/storage.service";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/project/project-news.model";
import { ProjectNewsHttpAdapter } from "../../adapters/project/project-news-http.adapter";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";

@Injectable({ providedIn: "root" })
export class ProjectNewsRepository implements ProjectNewsRepositoryPort {
  private readonly projectNewsAdapter = inject(ProjectNewsHttpAdapter);
  private readonly storageService = inject(StorageService);

  fetchNews(projectId: string): Observable<ApiPagination<FeedNews>> {
    return this.projectNewsAdapter
      .fetchNews(projectId)
      .pipe(map(page => ({ ...page, results: plainToInstance(FeedNews, page.results) })));
  }

  fetchNewsDetail(projectId: string, newsId: string): Observable<FeedNews> {
    return this.projectNewsAdapter
      .fetchNewsDetail(projectId, newsId)
      .pipe(map(news => plainToInstance(FeedNews, news)));
  }

  addNews(projectId: string, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.projectNewsAdapter
      .addNews(projectId, obj)
      .pipe(map(news => plainToInstance(FeedNews, news)));
  }

  readNews(projectId: number, newsIds: number[]): Observable<void[]> {
    const cachedReadNews = this.storageService.getItem<number[]>("readNews", sessionStorage) ?? [];
    const readNews = new Set<number>(cachedReadNews);
    const unreadIds = newsIds.filter(id => !readNews.has(id));

    if (unreadIds.length === 0) {
      return of([]);
    }

    return forkJoin(
      unreadIds.map(id =>
        this.projectNewsAdapter.setNewsViewed(projectId, id).pipe(
          tap(() => {
            readNews.add(id);
            this.storageService.setItem("readNews", [...readNews], sessionStorage);
          })
        )
      )
    );
  }

  delete(projectId: string, newsId: number): Observable<void> {
    return this.projectNewsAdapter.deleteNews(projectId, newsId);
  }

  toggleLike(projectId: string, newsId: number, state: boolean): Observable<void> {
    return this.projectNewsAdapter.toggleLike(projectId, newsId, state);
  }

  editNews(projectId: string, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.projectNewsAdapter
      .editNews(projectId, newsId, newsItem)
      .pipe(map(news => plainToInstance(FeedNews, news)));
  }
}
