<!-- @format -->

# Module: `news`

Cross-cutting модуль ленты новостей трёх владельцев (project / profile / program) поверх **единого дженерик-порта** + общего UI-info сервиса и виджетов. Плюс отдельная маркетинговая «статья» для feed.

## Единый порт `NewsRepositoryPort<T>`

`domain/news/port/news.repository.port.ts` — один абстрактный класс с дженериком `T` (тип новости владельца):

```ts
export abstract class NewsRepositoryPort<T> {
  abstract fetchNews(id: string, limit?: number, offset?: number): Observable<ApiPagination<T>>;
  abstract fetchNewsDetail(id: string, newsId: string): Observable<T>;
  abstract addNews(id: string, obj: { text: string; files: string[] }): Observable<T>;
  abstract readNews(id: number, newsIds: number[]): Observable<void[]>;
  abstract delete(id: string, newsId: number): Observable<void>;
  abstract toggleLike(id: string, newsId: number, state: boolean): Observable<void>;
  abstract editNews(id: string, newsId: number, newsItem: Partial<T>): Observable<T>;
}
```

Дженерик стирается в рантайме, поэтому один общий class-токен `NewsRepositoryPort` дал бы коллизию провайдеров (победил бы последний). Решение — **три раздельных `InjectionToken`** (там же, в `news.repository.port.ts`), каждый домен инжектит свой:

| Токен                     | Тип                               | Реализация (`infrastructure/repository/`) | DI-провайдер                           |
| ------------------------- | --------------------------------- | ----------------------------------------- | -------------------------------------- |
| `PROJECT_NEWS_REPOSITORY` | `NewsRepositoryPort<FeedNews>`    | `project/project-news.repository.ts`      | `di/project/project-news.providers.ts` |
| `PROFILE_NEWS_REPOSITORY` | `NewsRepositoryPort<ProfileNews>` | `profile/profile-news.repository.ts`      | `di/profile-news.providers.ts`         |
| `PROGRAM_NEWS_REPOSITORY` | `NewsRepositoryPort<FeedNews>`    | `program/program-news.repository.ts`      | `di/program/program-news.providers.ts` |

Каждая реализация делегирует в свой HTTP-адаптер (`*-news-http.adapter.ts`) под своим URL-префиксом (`/projects/<id>/news`, `/auth/users/<id>/news`, `/programs/<id>/news`); `readNews()` дедуплицирует просмотренные через `StorageService` (`sessionStorage`).

## Domain (`domain/news/`)

- `domain/news/project-news.model.ts` — `FeedNews` (используется project- и program-новостями).
- `domain/profile/profile-news.model.ts` — `ProfileNews` (профильные новости; остался в домене profile).
- `domain/news/article.model.ts` — маркетинговая статья для feed:

```ts
export class New {
  id: number;
  coverUrl: string;
  title: string;
  text?: string;
  shortText: string;
}
```

---

## Shared facade — `NewsInfoService`

`projects/social_platform/src/app/api/news/news-info.service.ts`. `providedIn: "root"`.

Универсальный UI-info контейнер для **списков новостей** любого происхождения (project / profile / program). Не привязан к конкретному repository — потребители сами загружают новости через свой port и кладут результат в `NewsInfoService` через `apply*` методы.

```ts
@Injectable({ providedIn: "root" })
export class NewsInfoService {
  readonly news$ = signal<AsyncState<FeedNews[]>>(initial());

  readonly news = computed(() => {
    const state = this.news$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  // CRUD-апплайеры — изменяют локальный signal:
  applySetNews(news: ApiPagination<FeedNews> | { results: never[]; count: number }): void;
  applyAddNews(newsRes: FeedNews): void; // в начало списка
  applyUpdateNews(results: FeedNews[]): void; // append (для пагинации)
  applyDeleteNews(newsId: number): void;
  applyEditNews(resNews: FeedNews): void; // map по id
  applyLikeNews(newsId: number): void; // toggle isUserLiked + ±1 likesCount
}
```

> **Особенность**: `applyLikeNews` мутирует state до подтверждения с сервера — оптимистичный UX. Если бэк отказал, нужно вручную позвать `applyLikeNews(id)` ещё раз для отката.

> `applySetNews` принимает либо полную `ApiPagination<FeedNews>`, либо хвостовое `{ results: never[]; count }` — используется когда use-case вернул `Result.fail` и хотим отрисовать пустой список.

---

## Widgets

### `<app-news-card>` (`app-news-card`)

Универсальная карточка новости. Поддерживает:

- Просмотр (текст + изображение + файлы).
- Лайк / снятие лайка (через `(like)` event, родитель должен дёрнуть `applyLikeNews`).
- Удаление (для владельца), редактирование, переход к деталям.

Inputs:

- `feedItem: FeedNews` (req).
- `resourceLink: (string | number)[]` (req) — массив сегментов URL для router-link навигации к деталям. Зависит от контекста:
  - Для feed: `[]` (без префикса).
  - Для project-news: `["/office/projects/", projectId, "news"]`.
  - Для profile-news: `["/office/profile/", userId, "news"]`.
  - Для program-news: `["/office/program/", programId]` (детали ленты программы — открываются как часть main-страницы программы).
- `contentId?: number` — id внешней сущности (project/profile/program), для оптимизаций.
- `isOwner?: boolean` — для отображения кнопок редактировать/удалить.

Outputs:

- `delete: number` — id новости.
- `like: number` — id новости.
- `edited: FeedNews` — после inline-edit.

Подкомпонент `carousel` — для карусели изображений/файлов.

Полная документация компонента — [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md#newscardcomponent--newsformcomponent).

### `<app-news-form>` (`app-news-form`)

Форма создания / редактирования новости. Поддерживает текст + загрузку файлов.

Inputs: — (форма управляется внутренней `ReactiveForm`).

Outputs:

- `addNews: { text: string; files: string[] }` — на submit.

Метод `onResetForm()` (публичный) — для ручного сброса формы из родителя после успешной отправки.
Метод `onCloseEditMode()` (публичный) — для выхода из режима редактирования.

---

## HTTP — нет общих эндпоинтов

Каждый "вид" новостей ходит на свой бэк-префикс:

| Тип     | Префикс                                                                        |
| ------- | ------------------------------------------------------------------------------ |
| project | `/projects/<projectId>/news/...` (см. [`docs/modules/project.md`](project.md)) |
| profile | `/auth/users/<userId>/news/...` (см. [`docs/modules/profile.md`](profile.md))  |
| program | `/programs/<programId>/news/...` (см. [`docs/modules/program.md`](program.md)) |
| article | (пока без endpoint в этом модуле — see feed)                                   |

Все три варианта зеркальны по форме (`fetch / set_viewed / set_liked / add / edit / delete`), но имеют разные URL.

---

## Consumers

| Где                                      | Как использует                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pages/projects/detail/info`             | Project news через `<app-news-card>` + `<app-news-form>` (для лидера).                                                |
| `pages/projects/detail/news-detail`      | Детальная страница новости проекта.                                                                                   |
| `pages/program/detail/main`              | Program news.                                                                                                         |
| `pages/profile/detail/profile-news`      | Profile news (детальная страница).                                                                                    |
| `pages/feed`                             | Глобальная лента — комбинация project / program / profile / article новостей (см. [`docs/modules/feed.md`](feed.md)). |
| `widgets/news-card`, `widgets/news-form` | Сами виджеты используют `NewsInfoService` через входы / выходы.                                                       |

---
