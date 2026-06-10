<!-- @format -->

# `social_platform` — shared layer

Этот документ покрывает «общие» части `social_platform`, которые не привязаны к конкретному модулю:

- `domain/shared/` — `AsyncState`, `Result`, `toAsyncState`, `EntityCache`, `EventBus`, `DomainEvent`.
- `domain/file/` — `FileModel`.
- `domain/other/` — pagination / filter-config / navigation / notification.
- `utils/` — 21 чистый хелпер.

Все эти куски — фундамент: на них опираются репозитории, фасады, виджеты, страницы, валидаторы форм. Высокоуровневый разбор слоёв и cross-cutting блоков — в [`docs/social-platform/architecture.md`](architecture.md). Здесь — конкретные сигнатуры и поведение.

---

## `domain/shared/`

| Файл                | Экспорт                                                                                                            | Что                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `async-state.ts`    | `AsyncState<T, E>`, `initial`, `loading`, `success`, `failure`, `isInitial`, `isLoading`, `isSuccess`, `isFailure` | Discriminated union для состояния асинхронной операции.                  |
| `result.type.ts`    | `Result<T, E>`, `ok`, `fail`                                                                                       | Контракт возврата из use-case'ов.                                        |
| `to-async-state.ts` | `toAsyncState<T, E>`                                                                                               | RxJS-оператор `Observable<Result<T, E>> → Observable<AsyncState<T, E>>`. |
| `entity-cache.ts`   | `class EntityCache<T>`                                                                                             | In-memory cache с опциональным TTL и stale-while-revalidate.             |
| `event-bus.ts`      | `class EventBus` (`@Injectable({ providedIn: "root" })`)                                                           | Глобальный pub/sub на `Subject<DomainEvent>`.                            |
| `domain-event.ts`   | `interface DomainEvent`                                                                                            | Базовый контракт для domain-событий.                                     |

### `AsyncState<T, E>`

```ts
type AsyncState<T, E = string> =
  | { readonly status: "initial" }
  | { readonly status: "loading"; readonly previous?: T }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "failure"; readonly error: E; readonly previous?: T };
```

| Хелпер                                                                         | Что возвращает                           | Когда использовать                                                          |
| ------------------------------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| `initial()`                                                                    | `{ status: "initial" }`                  | Дефолтное состояние сигнала (ничего не загружали).                          |
| `loading(previous?)`                                                           | `{ status: "loading", previous }`        | Перед стартом операции; `previous` — старое значение для оптимистичного UI. |
| `success(data)`                                                                | `{ status: "success", data }`            | Успех.                                                                      |
| `failure(error, previous?)`                                                    | `{ status: "failure", error, previous }` | Ошибка; `previous` — данные до ошибки.                                      |
| `isInitial(state)`, `isLoading(state)`, `isSuccess(state)`, `isFailure(state)` | `boolean` (с type narrowing)             | Type guards для шаблонов и `computed`.                                      |

`previous` — оптимистичная семантика: при refresh показываем старые данные пока идёт `loading`; при ошибке показываем последние удавшиеся данные плюс `error`.

**Где обычно лежит**: в фасаде:

```ts
readonly course$ = signal<AsyncState<CourseDetail>>(initial());
// в UI-info:
readonly course = computed(() => {
  const state = this.course$();
  return isSuccess(state) ? state.data : undefined;
});
readonly loading = computed(() => isLoading(this.course$()));
```

### `Result<T, E>`

```ts
type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

`ok(value)` / `fail(error)` — фабрики. Use-case возвращает `Observable<Result<T, E>>` и **никогда не выбрасывает** — все ошибки представимы в `Result.fail`.

Типичный паттерн ошибки — discriminated union:

```ts
type GetCourseDetailError = { kind: "get_course_detail_error"; cause?: unknown };
//   { kind: "not_found" } | { kind: "forbidden" } | { kind: "server_error" }  // в более продвинутых use-case
```

### `toAsyncState<T, E>(previous?)`

RxJS-оператор. Применяется в фасаде между use-case и сигналом:

```ts
this.useCase
  .execute(id)
  .pipe(toAsyncState(previousValue))
  .subscribe(state => this.signal.set(state));
```

Что делает:

1. Эмитит `loading(previous)` сразу при подписке.
2. На `Result.ok` → `success(value)`.
3. На `Result.fail` → `failure(error, previous)`.
4. Если HTTP-ошибка проскочила мимо use-case (не должна) → `failure(err.message ?? "Unknown error", previous)`.

### `EntityCache<T>`

```ts
export class EntityCache<T> {
  private readonly store = new Map<number, { observable: Observable<T>; expiresAt: number }>();
  private readonly inflight = new Map<number, Subscription>();

  constructor(ttlMs?: number);

  getOrFetch(id: number, factory: () => Observable<T>): Observable<T>;
  invalidate(id: number): void;
  clear(): void;
}
```

In-memory кеш с опциональным TTL и **stale-while-revalidate**:

- **без `ttlMs`** — бесконечный кеш, инвалидация только вручную (`invalidate(id)` / `clear()`) или через `EventBus`;
- **с `ttlMs`** — после истечения TTL `getOrFetch` отдаёт стухшие данные сразу и запускает фоновый re-fetch (`scheduleRevalidate`); по завершении рефетча подписчики получают свежие данные. Параллельные ревалидации одного `id` дедуплицируются через `inflight`.

Записи store унифицированы как `{ observable, expiresAt }` (`expiresAt = Infinity`, если TTL не задан). Применён к `Project`, `Vacancy`, `Program`, `Courses` и news/subscription репозиториям. TTL: `Courses.detailCache` — 10 мин, `Program` — 5 мин; `Project`, `Vacancy`, `project-news`, `project-subscription`, `Courses.structureCache` — без TTL (инвалидация по domain events / вручную).

### `EventBus`

```ts
@Injectable({ providedIn: "root" })
export class EventBus {
  emit<T extends DomainEvent>(event: T): void;
  on<T extends DomainEvent>(type: T["type"]): Observable<T>;
}
```

Чистый pub/sub-примитив домена — без сайд-эффектов (логирования, инфраструктуры). Если нужна трассировка событий, подпишись на `on(...)` из отдельного app-level сервиса.

Используется чтобы один модуль уведомил другой о событии без прямой зависимости. Например, `ProjectRepository` слушает события вакансий (`SendVacancyResponse`, `AcceptVacancyResponse`, `RejectVacancyResponse`) и инвалидирует кеш проекта.

### `DomainEvent`

```ts
export interface DomainEvent {
  readonly type: string;
  readonly payload: unknown;
  readonly occurredAt: Date;
}
```

Контракт для всех domain-событий. На каждое событие создаётся свой файл в `domain/<module>/events/<event-name>.event.ts` с фабрикой:

```ts
// domain/courses/events/task-answer-submitted.event.ts
export const taskAnswerSubmitted = (
  taskId: number,
  moduleId: number,
  answer: CourseTaskAnswer,
) => ({
  type: "TaskAnswerSubmitted" as const,
  payload: { taskId, moduleId, answer },
  occurredAt: new Date(),
});
```

Подписчик типизированно фильтрует:

```ts
this.eventBus.on<ReturnType<typeof taskAnswerSubmitted>>("TaskAnswerSubmitted")
  .subscribe(event => /* ... */);
```

---

## `domain/file/`

Один файл — `file.model.ts`:

```ts
export class FileModel {
  datetimeUploaded!: string;
  extension!: string;
  link!: string;
  mimeType!: string;
  name!: string;
  size!: number;
  user!: number;

  static default(): { ... }
}
```

Используется везде, где хранится загруженный файл — задачи, профили, новости, чаты. Поле `link` — URL на CDN (`api.selcdn.ru/...`).

> `static default()` возвращает заглушку с фейковыми значениями (`"string"` строки, `1` числа). Используется в тестах и для placeholder UI.

---

## `domain/other/`

Сборник «общих» доменных типов, которые не относятся к одному модулю.

### `api-pagination.model.ts`

```ts
interface ApiPagination<T> {
  count: number; // общее количество
  results: T[]; // элементы текущей страницы
  next: string; // URL следующей (или null)
  previous: string; // URL предыдущей (или null)
}
```

Стандартная структура пагинированного ответа REST API (`/projects/?page=N` и т. п.). Используется в адаптерах перед маппингом в `T[]`.

### `filter-fields.model.ts`

Конфигурация декларативных фильтров — описание полей, которое потом потребляет `<app-projects-filter>` / `<app-vacancy-filter>` / `<app-feed-filter>`.

```ts
interface UnifiedOption {
  id: string | number;
  label: string;
  value?: string | number | boolean;
}

interface FilterFieldConfig {
  queryParam: string; // имя в query string
  type: "checkbox" | "radio" | "select" | "range" | "switch" | "autocomplete" | "slider";
  title: string;
  defaultValue?: any;
  options?: Array<{ id: any; label: string; value?: any }>;
  dataSource?: Observable<any[]>; // опц. для динамических списков
  displayField?: string;
  valueField?: string;
  config?: any; // тип-специфичные параметры
}

interface FilterConfig {
  fields: FilterFieldConfig[];
  clearParams?: string[];
  title?: string;
  showClearButton?: boolean;
}
```

### `navigation.model.ts`

```ts
interface Navigation {
  step: EditStep;
  src: string;
  label: string;
}
```

Тип элемента пошаговой навигации в редакторах профиля и проекта (см. `core/consts/navigation/nav-profile-items.const.ts`, `nav-project-items.const.ts`). `EditStep` импортируется из `@api/project/project-step.service`.

### `notification.model.ts`

```ts
class Notification {
  id!: number;
  text!: string;
  readAt!: string | null;
}
```

Уведомление в шапке. `readAt` — `null` если не прочитано, иначе ISO-дата. Используется `NotificationService` (см. `ui/services/notification`).

---

## `utils/`

Маленькие чистые функции и валидаторы — без Angular DI. Каждый файл — отдельный экспорт; общего `index.ts` нет, импорт через `@utils/<name>`.

| Файл                        | Экспорт                                                                                     | Что                                                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `animate-content-height.ts` | `animateContentHeight(elem, updateContent)`                                                 | Анимирует высоту элемента при изменении контента: фиксирует start/end через `getBoundingClientRect`, выставляет CSS-transition `height 280ms ease`.                                                  |
| `calculateProgress.ts`      | `calculateProfileProgress(user)`                                                            | Процент заполнения профиля (0-100). Идёт по `core/consts/other/profile-fields.const.ts` (массивы / строки), считает заполненные.                                                                     |
| `capitalize-string.ts`      | `capitalizeString(str)`                                                                     | Каждое слово с заглавной, остальное в нижнем регистре.                                                                                                                                               |
| `dashboardItemBuilder.ts`   | `dashboardItemBuilder(amount, sections, titles, icons, arrays)` + `interface DashboardItem` | Строит массив `DashboardItem[]` для дашборда projects-list.                                                                                                                                          |
| `days-untit.ts`             | `daysUntil(date)`                                                                           | Целое число дней до даты. **Опечатка в имени файла** (`days-untit` вместо `days-until`).                                                                                                             |
| `directionItemBuilder.ts`   | `directionItemBuilder(amount, ...)` + `interface DirectionItem`                             | То же что `dashboardItemBuilder`, но для направлений проектов.                                                                                                                                       |
| `expand-element.ts`         | `expandElement(elem, expandedClass, isExpanded)`                                            | Анимированное добавление/удаление класса с пересчётом height. Используется в `<app-detail>`, `<app-news-card>` и пр.                                                                                 |
| `exponentialBackoff.ts`     | `exponentialBackoff(maxAttemps)`                                                            | RxJS retry-config: `2^retryCount * 1000` мс, **только** для 5xx и сетевых (4xx не ретраятся). Использует `ApiService`. **Опечатка**: `maxAttemps` вместо `maxAttempts`.                              |
| `export-file.ts`            | `saveFile(blob, type, name?)`                                                               | Скачивание `Blob` через `file-saver`. Имя файла собирает по типу: `projects-<name>-<DD.MM.YYYY>.xlsx`, `scores-<name>-<date>.xlsx`, `projects_review-<name>-<date>.xlsx`, или `<name>.pdf` для `cv`. |
| `generate-options-list.ts`  | `generateOptionsList(amount, type, otherStrings?)` + `interface optionsListElement`         | Генератор массива `{ id, value, label }` для `<app-select>`. Поддерживает `numbers` / `years` / `strings`.                                                                                           |
| `getActionType.ts`          | `getActionType(actionId)`                                                                   | Имя иконки для action-типа канбан-задачи. **Используется только канбаном** (модуль отключён).                                                                                                        |
| `getPriorityType.ts`        | `getPriorityType(priorityId, type, opacity?)`                                               | Inline-стили для приоритета канбан-задачи (background или color). **Канбан-only**.                                                                                                                   |
| `hexToRgba.ts`              | `hexToRgba(hex, alpha)`                                                                     | `"#RRGGBB"` → `"rgba(r, g, b, a)"`. С non-null assertion на match — упадёт на невалидном hex.                                                                                                        |
| `inviteToProjectMapper.ts`  | `inviteToProjectMapper(invites)`                                                            | Маппит `Invite[]` в массив проектов с метаданными приглашения. Возвращает `any[]` — недотипизирован.                                                                                                 |
| `is-html-text-truncated.ts` | `isHtmlTextTruncated(value, limit)`                                                         | Проверяет, превышает ли текст (без HTML-тегов) лимит символов. Для решения «показать ли кнопку «подробнее»».                                                                                         |
| `optionalUrl.validator.ts`  | `optionalUrlOrMentionValidator` (`ValidatorFn`)                                             | Валидатор: пустая строка — ОК; иначе — должна быть URL (`https?://...`) или mention (`@username`). Возвращает `{ invalidLink: true }` при ошибке.                                                    |
| `responsive.ts`             | `containerSm = 680`, `containerMd = 1280`                                                   | Константы breakpoint'ов в TypeScript. Дублирует SCSS-миксины в `styles/_responsive.scss`.                                                                                                            |
| `stripNull.ts`              | `stripNullish(obj)`                                                                         | Возвращает `Partial<T>` без `null` / `undefined` / пустых строк. Используется при подготовке формы к API.                                                                                            |
| `transformYear.ts`          | `transformYearStringToNumber(value)`                                                        | Берёт первые 5 символов строки и конвертит в `Number`. Без валидации — для input-mask на годе.                                                                                                       |
| `video-url-embed.ts`        | (несколько внутренних хелперов)                                                             | Распознавание видео-ссылок (YouTube `youtu.be`/`youtube.com`/`m.youtube.com`, прямые `.mp4`/`.webm`/`.ogg`/`.mov`/`.m4v`), чёрный список хостов (`disk.yandex.ru`, `yadi.sk`).                       |
| `yearRangeValidators.ts`    | `yearRangeValidators(entryField, completionField)` (`ValidatorFn`)                          | Группа-валидатор: `entryYear ≤ completionYear`. Используется в `profile-edit` для образования и опыта работы.                                                                                        |

---
