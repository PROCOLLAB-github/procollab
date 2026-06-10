<!-- @format -->

# Module: `feed`

Глобальная лента (`/office/feed`) — единственная страница на платформе, агрегирующая контент **разных типов**: новые проекты, открытые вакансии, новости (project / profile / program), плюс маркетинговые «адверты».

## Назначение

- **Лента** (`/office/feed`) — бесконечная пагинация поверх единого API-эндпоинта `/feed/`, который возвращает discriminated union `FeedItem` с полем `typeModel: "project" \| "vacancy" \| "news"`.
- **Фильтрация по типу контента** через `<app-feed-filter>` ([`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md)) — сохраняется в query `?type=project|vacancy|news`.
- **Like / read** для новостей ленты — отдельные use-case'ы.

---

## Domain (`domain/feed/`)

### `feed-item.model.ts`

```ts
interface FeedProject {
  id: number;
  name: string;
  shortDescription: string;
  industry: number;
  imageAddress: string;
  viewsCount: number;
  leader: number;
  partnerProgram: { id: number; name: string } | null; // ссылка на программу
}

type FeedItemType = "vacancy" | "news" | "project";

type FeedItem =
  | { typeModel: "project"; content: FeedProject }
  | { typeModel: "vacancy"; content: Vacancy }
  | { typeModel: "news"; content: FeedNews & { contentObject: { id: number } } };
```

### Port

```ts
abstract class FeedRepositoryPort {
  fetchFeed(
    offset: number,
    limit: number,
    type: string, // "project|vacancy|news" (joined with FILTER_SPLIT_SYMBOL = "|")
  ): Observable<ApiPagination<FeedItem>>;
}
```

DI-биндинг (`infrastructure/di/feed.providers.ts`):

```ts
{ provide: FeedRepositoryPort, useExisting: FeedRepository }
```

> Только `fetchFeed` — like / read новостей делегируются в `PROJECT_NEWS_REPOSITORY` или `PROFILE_NEWS_REPOSITORY` через отдельные use-case'ы. См. ниже.

---

## Use-cases (3 шт., `api/feed/use-cases/`)

| Use-case                | Параметры                           | Возвращает                                                              | Куда делегирует                                                                                          |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `FetchFeedUseCase`      | `offset, limit, type: string`       | `Result<ApiPagination<FeedItem>, { kind: "fetch_feed_error"; cause? }>` | `FeedRepositoryPort.fetchFeed`                                                                           |
| `ToggleFeedLikeUseCase` | `ownerType, ownerId, newsId, state` | `Result<void, ...>`                                                     | По типу владельца дёргает `PROJECT_NEWS_REPOSITORY.toggleLike` или `PROFILE_NEWS_REPOSITORY.toggleLike`. |
| `ReadFeedNewsUseCase`   | `ownerType, ownerId, newsIds`       | `Result<void[], ...>`                                                   | Аналогично — батчевая отметка просмотренных.                                                             |

> `FeedInfoService` определяет владельца новости по `FeedItem.typeModel` и `contentObject`, затем передаёт `ownerType` в `ToggleFeedLikeUseCase` / `ReadFeedNewsUseCase`. Feed не имеет своих like / read endpoint'ов на бэке, всё идёт через owners.

---

## Facades (`api/feed/facades/`)

### `FeedInfoService`

`@Injectable()` (page-scoped). Управляет ленты:

- Подписан на `route.data` для initial-загрузки из resolver'а.
- `IntersectionObserver` для бесконечной пагинации — при попадании последнего элемента в viewport дёргает `fetchFeedUseCase` с инкрементированным offset.
- Реагирует на изменения query `?type=...` — пересобирает фильтр, сбрасывает offset и пагинацию.
- `onLikeFeedItem(item)` → `ToggleFeedLikeUseCase` → оптимистичная мутация `feedUIInfoService.applyToggleLike()`.
- `onFeedItemView(entries)` → `ReadFeedNewsUseCase` для просмотренных новостей.

Константы:

```ts
const DEFAULT_FEED_TYPES: FeedItemType[] = ["vacancy", "project", "news"];
const FILTER_SPLIT_SYMBOL = "|";
```

### `FeedUIInfoService`

UI-state:

- `feedItems$ AsyncState<FeedItem[]>` (через `applyInitializationFeedNewsEvent`, `applyAddFeedItems`, `applyToggleLike`).
- `feedItems` computed массив для шаблона.
- `feedTake` (default 10), `feedOffset`, `count`.
- Сигналы для UI-индикаторов (loading further, has-more).

---

## Repository & Adapter

### `FeedRepository` (`infrastructure/repository/feed/feed.repository.ts`)

Pass-through к адаптеру. Без трансформаций — типы фронта совпадают с DTO.

### `FeedHttpAdapter` (`infrastructure/adapters/feed/feed-http.adapter.ts`)

| Метод                            | HTTP | URL      | Параметры                                                         | Ответ                     |
| -------------------------------- | ---- | -------- | ----------------------------------------------------------------- | ------------------------- |
| `fetchFeed(offset, limit, type)` | GET  | `/feed/` | `?limit, offset, type` (тип через `\|`, например `vacancy\|news`) | `ApiPagination<FeedItem>` |

Один-единственный endpoint.

---

## Routes

Подключено в **office shell routes** (`ui/routes/office/office.routes.ts`):

```ts
{
  path: "feed",
  component: FeedComponent,
  resolve: { data: FeedResolver },
}
```

Отдельной `ui/routes/feed/` нет.

`FeedResolver` дёргает `FetchFeedUseCase.execute(0, 10, "vacancy|news|project")` (default-фильтр).

---

## Pages (`ui/pages/feed/`)

| Page                   | Файл                                                | Selector           | Что                                                                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FeedComponent`        | `pages/feed/feed.component.ts`                      | `app-feed`         | Главный компонент. Рендерит `<app-feed-filter>`, заголовок, scroll-контейнер с `@for (item of feedItems(); ...) { @switch (item.typeModel) ... }`. Provides `FeedInfoService` + `FeedUIInfoService`.                            |
| `NewProjectComponent`  | `pages/feed/new-project/new-project.component.ts`   | `app-new-project`  | Карточка нового проекта в ленте (`typeModel === "project"`). Принимает `@Input() project: FeedProject`. Имя отрасли тянет через `IndustryInfoService.getOne(project.industry)` (см. [`docs/modules/industry.md`](industry.md)). |
| `OpenVacancyComponent` | `pages/feed/open-vacancy/open-vacancy.component.ts` | `app-open-vacancy` | Карточка открытой вакансии в ленте (`typeModel === "vacancy"`). Принимает `@Input() vacancy: Vacancy`.                                                                                                                          |

Для `typeModel === "news"` используется общий `<app-news-card>` ([`docs/modules/news.md`](news.md)).

---

## Widgets

| Widget              | Где                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `<app-feed-filter>` | [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md) — фильтр по типу контента. |
| `<app-news-card>`   | то же — для `typeModel === "news"`.                                                                 |

---

## Consumers

| Где                          | Как использует                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `pages/office/...`           | Feed — главная страница office shell (`/office` редиректит на `/office/feed`). |
| `IndustryInfoService.getOne` | `NewProjectComponent` отображает имя отрасли.                                  |

---
