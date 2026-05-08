<!-- @format -->

# Module: `news`

Маленький cross-cutting модуль, объединяющий ленту **разных типов новостей** одной общей логикой презентации:

- **Project news** — `domain/project/project-news.model.ts`, `domain/project/ports/project-news.repository.port.ts`. Документирован в [`docs/modules/project.md`](project.md).
- **Profile news** — `domain/profile/profile-news.model.ts`, `domain/profile/ports/profile-news.repository.port.ts`. Документирован в [`docs/modules/profile.md`](profile.md).
- **Program news** — `domain/program/ports/program-news.repository.port.ts`. Документирован в [`docs/modules/program.md`](program.md).
- **Article** — отдельная маркетинговая новость для feed (`domain/news/article.model.ts`).

Этот документ покрывает **общие** части — UI-info сервис `NewsInfoService`, виджеты `<app-news-card>` / `<app-news-form>`, домен `New` (article).

---

## Domain (`domain/news/`)

### `article.model.ts`

```ts
export class New {
  id: number;
  coverUrl: string;
  title: string;
  text?: string;
  shortText: string;
}
```

> Имя класса `New` — почти зарезервированное слово в JavaScript (`new`-оператор). В коде это работает, но при копировании в шаблоны может конфузить. Используется в feed-articles (см. [`docs/modules/feed.md`](feed.md)).

> Имя файла во множественном числе (`article`), а класс — singular (`New`). Это **разные** концепции: `New` — отдельная статья, `Article` файл — про категорию статей. Рекомендуется переименовать `article.model.ts` → `news-article.model.ts`, класс `New` → `NewsArticle`.

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

## Известные проблемы

| Что                                                                                                                                           | Где                                                                  | Заметка                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Тип `FeedNews` живёт в `domain/project/project-news.model.ts`, а не в `domain/news/`                                                          | `domain/project/...`                                                 | Должен быть в общем месте, раз потребляется тремя модулями (project, profile, program) и feed. Перенос ломающий — много импортов. |
| `New` (singular) класс в `domain/news/article.model.ts` (plural)                                                                              | `domain/news/article.model.ts`                                       | Переименовать в `NewsArticle` для ясности.                                                                                        |
| Три репозитория с одинаковым контрактом (`fetchNews / addNews / readNews / toggleLike / delete / editNews`) — для project / profile / program | `domain/{project,profile,program}/ports/...-news.repository.port.ts` | Кандидат для генерализации в `domain/news/ports/` с параметром "тип владельца". Сейчас тройная копипаста.                         |
| Универсальный `NewsInfoService` хранит signal, но потребители сами должны звать `apply*` методы                                               | `api/news/news-info.service.ts`                                      | OK для текущего флоу, но добавляет хрупкости — легко забыть `applyLikeNews()` после успеха `toggleLike()`.                        |
| `applyLikeNews` оптимистично мутирует — нет автоматического отката при ошибке                                                                 | `news-info.service.ts`                                               | Документировать или переделать на «после ответа сервера».                                                                         |
| `static default()` на `FeedNews` отдаёт фейковый URL `api.selcdn.ru/...` — может попасть в production                                         | `project-news.model.ts:default`                                      | Используется в тестах; не критично.                                                                                               |
