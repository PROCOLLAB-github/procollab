/** @format */

import { Injectable, signal } from "@angular/core";
import { FeedNews } from "../../domain/project/project-news.model";
import { ApiPagination } from "../../domain/other/api-pagination.model";

@Injectable({ providedIn: "root" })
export class NewsInfoService {
  readonly news = signal<FeedNews[]>([]); // Массив новостей

  applySetNews(
    news:
      | ApiPagination<FeedNews>
      | {
          results: never[];
          count: number;
        }
  ): void {
    this.news.set(news.results);
  }

  applyAddNews(newsRes: any): void {
    this.news.update(list => [newsRes, ...list]);
  }

  applyUpdateNews(results: FeedNews[]): void {
    this.news.update(news => [...news, ...results]);
  }

  applyDeleteNews(newsId: number): void {
    this.news.update(news => news.filter(n => n.id !== newsId));
  }

  applyEditNews(resNews: any): void {
    this.news.update(news => news.map(n => (n.id === resNews.id ? resNews : n)));
  }

  applyLikeNews(newsId: number): void {
    this.news.update(list =>
      list.map(n =>
        n.id === newsId
          ? {
              ...n,
              isUserLiked: !n.isUserLiked,
              likesCount: n.isUserLiked ? n.likesCount - 1 : n.likesCount + 1,
            }
          : n
      )
    );
  }
}
