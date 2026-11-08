/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { FeedPage } from "@domain/feed/feed-item.model";
import { FetchFeedUseCase } from "@api/feed/use-cases/fetch-feed.use-case";
import { getFeedFilter } from "@core/consts/filters/feed-filter.const";

/** Предзагружает ленту новостей. */
export const FeedResolver: ResolveFn<FeedPage> = route => {
  const fetchFeedUseCase = inject(FetchFeedUseCase);

  // Загружаем первую страницу ленты тремя рядами по две карточки.
  return fetchFeedUseCase.execute(0, 6, getFeedFilter(route.queryParams["includes"]).apiType).pipe(
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
