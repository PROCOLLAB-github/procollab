/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { FeedNews } from "../../domain/project/project-news.model";
import { ApiPagination } from "../../domain/other/api-pagination.model";
import {
  AsyncState,
  initial,
  isLoading,
  isSuccess,
  success,
} from "../../domain/shared/async-state";

@Injectable({ providedIn: "root" })
export class NewsInfoService {
  readonly news$ = signal<AsyncState<FeedNews[]>>(initial()); // Массив новостей

  readonly news = computed(() => {
    const state = this.news$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  applySetNews(
    news:
      | ApiPagination<FeedNews>
      | {
          results: never[];
          count: number;
        }
  ): void {
    this.news$.set(success(news.results));
  }

  applyAddNews(newsRes: FeedNews): void {
    this.news$.update(state =>
      isSuccess(state) ? success([newsRes, ...state.data]) : success([newsRes])
    );
  }

  applyUpdateNews(results: FeedNews[]): void {
    this.news$.update(state =>
      isSuccess(state) ? success([...state.data, ...results]) : success(results)
    );
  }

  applyDeleteNews(newsId: number): void {
    this.news$.update(state =>
      isSuccess(state) ? success(state.data.filter(n => n.id !== newsId)) : state
    );
  }

  applyEditNews(resNews: FeedNews): void {
    this.news$.update(state =>
      isSuccess(state) ? success(state.data.map(n => (n.id === resNews.id ? resNews : n))) : state
    );
  }

  applyLikeNews(newsId: number): void {
    this.news$.update(list =>
      isSuccess(list)
        ? success(
            list.data.map(n =>
              n.id === newsId
                ? {
                    ...n,
                    isUserLiked: !n.isUserLiked,
                    likesCount: n.isUserLiked ? n.likesCount - 1 : n.likesCount + 1,
                  }
                : n
            )
          )
        : list
    );
  }
}
