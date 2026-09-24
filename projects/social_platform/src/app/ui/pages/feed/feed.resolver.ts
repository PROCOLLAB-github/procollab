/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { FeedItemType, FeedPage } from "@domain/feed/feed-item.model";
import { FetchFeedUseCase } from "@api/feed/use-cases/fetch-feed.use-case";
import { FILTER_SPLIT_SYMBOL } from "@core/consts/other/filter-split-symbol.const";

const DEFAULT_FEED_TYPES: FeedItemType[] = ["vacancy", "news", "project"];

/** Предзагружает ленту новостей. */
export const FeedResolver: ResolveFn<FeedPage> = route => {
  const fetchFeedUseCase = inject(FetchFeedUseCase);

  // Загружаем первую страницу ленты тремя рядами по две карточки.
  // По умолчанию включаем вакансии, новости и проекты
  return fetchFeedUseCase
    .execute(0, 6, route.queryParams["includes"] ?? DEFAULT_FEED_TYPES.join(FILTER_SPLIT_SYMBOL))
    .pipe(
      map(result =>
        result.ok
          ? result.value
          : {
              count: 0,
              results: [],
              next: "",
              previous: "",
            },
      ),
    );
};
