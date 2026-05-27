<!-- @format -->

# `social_platform` — архитектура

`projects/social_platform/` — единственное Angular-приложение в воркспейсе. Всё, что лежит в `app/`, организовано по **слоистой архитектуре в стиле Hexagonal/Clean**: domain ничего не знает о фреймворке, infrastructure реализует порты домена, api оркестрирует операции через use-cases и фасады, ui потребляет фасады.

## Структура папок

```
projects/social_platform/src/app/
  domain/           # типы, модели, repository ports, domain events — без Angular DI
  api/              # use-cases (одна операция = один класс) + facades + UI-info
    <module>/
      use-cases/
      facades/
        ui/         # UI-info сервисы с computed-сигналами поверх фасадов
  infrastructure/
    repository/     # реализации портов (HTTP-репозитории)
    adapters/       # DTO ↔ domain трансформации
    di/             # Provider[]-массивы для регистрации портов в app.config.ts
  ui/
    routes/         # лениво подгружаемые группы Routes
    pages/          # страницы — smart components, потребляют фасады
    widgets/        # переиспользуемые блоки (один-два потребителя на каждый)
    primitives/     # атомы (input, button, modal, tag, dropdown, ...)
    services/       # runtime UI-сервисы: loading, snackbar, nav, notification
  utils/            # маленькие чистые хелперы
  app.component.*   # корневой компонент
  app.config.ts     # DI-конфигурация приложения (см. ниже)
  app.routes.ts     # корневой Routes массив
```

## Правила зависимостей

```
ui  ─┬──▶ api ──▶ domain ◀── infrastructure
     └────────────▶ domain (только для типов)
```

- **`domain`** — никаких Angular DI, никаких HTTP, никаких сторонних библиотек кроме типов.
- **`api/use-cases`** инжектят порты из `domain`; реализация подменяется через `infrastructure/di/*.providers.ts`.
- **`api/facades`** инжектят use-cases, выставляют `signal<AsyncState<T,E>>` для UI.
- **`infrastructure/repository`** реализуют интерфейс порта (`implements XRepositoryPort`), внутри HTTP через `ApiService` + опционально `EntityCache<T>`.
- **`ui`** импортирует фасады/UI-info из `api`, типы из `domain`, примитивы из `@uilib`/`@ui/primitives`. Никогда не лезет в `infrastructure` напрямую.

---

## Слой `domain/`

Папка на каждый домен (`auth`, `chat`, `courses`, `feed`, `industry`, `invite`, `kanban`, `member`, `news`, `profile`, `program`, `project`, `skills`, `specializations`, `vacancy`) + общие папки `shared/`, `file/`, `other/`.

В каждой доменной папке:

| Файл / папка                 | Что                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `*.model.ts`                 | TypeScript-интерфейсы и классы доменной модели. Без декораторов Angular.              |
| `ports/*.repository.port.ts` | `abstract class` (используется как DI-токен) с сигнатурами методов репозитория.       |
| `events/*.event.ts`          | Domain events (если используется EventBus). Каждый файл экспортирует фабрику события. |
| `commands/*.command.ts`      | Структуры данных для use-case'ов (используется в новых модулях, опционально).         |
| `results/*.result.ts`        | Структуры результатов use-case'ов с явными ошибками.                                  |

Зачем `abstract class` для портов вместо `interface`: TypeScript-интерфейсы стираются на runtime → их нельзя использовать как DI-токен. `abstract class` даёт runtime-конструктор, который Angular DI использует как ключ.

```ts
// domain/courses/ports/courses.repository.port.ts
export abstract class CoursesRepositoryPort {
  abstract getCourses(): Observable<CourseCard[]>;
  abstract getCourseDetail(courseId: number): Observable<CourseDetail>;
  // ...
}
```

### `domain/shared/` — общие примитивы

Полная документация — [`docs/social-platform/shared.md`](shared.md). Содержит:

- `async-state.ts` — `AsyncState<T, E>` дискриминатор и хелперы.
- `result.type.ts` — `Result<T, E>` для возврата из use-case.
- `to-async-state.ts` — оператор RxJS `Observable<Result<T,E>>` → `Observable<AsyncState<T,E>>`.
- `entity-cache.ts` — простой in-memory cache с `shareReplay(1)`.
- `event-bus.ts` — `EventBus` (`@Injectable({ providedIn: "root" })`) для domain-событий.
- `domain-event.ts` — базовый интерфейс `DomainEvent`.

---

## Слой `api/`

На каждый домен — папка `api/<module>/` с подпапками:

```
api/<module>/
  use-cases/
    <verb>-<entity>.use-case.ts
    <verb>-<entity>.use-case.spec.ts
  facades/
    <module>-info.service.ts          # facade
    ui/<module>-ui-info.service.ts    # UI-info с computed
  dto/                                # опц., DTO специфичные для api
```

### Use-cases

Один use-case = один публичный метод `execute(...)`. Возвращает `Observable<Result<T, E>>` (новые модули) или `Observable<T>` (старые).

```ts
// api/courses/use-cases/get-course-detail.use-case.ts
@Injectable({ providedIn: "root" })
export class GetCourseDetailUseCase {
  private readonly coursesRepository = inject(CoursesRepositoryPort);

  execute(
    courseId: number
  ): Observable<Result<CourseDetail, { kind: "get_course_detail_error"; cause?: unknown }>> {
    return this.coursesRepository.getCourseDetail(courseId).pipe(
      map(detail => ok<CourseDetail>(detail)),
      catchError(error => of(fail({ kind: "get_course_detail_error" as const, cause: error })))
    );
  }
}
```

**Конвенции**:

- Имя файла — `<verb>-<entity>.use-case.ts` (`get-board.use-case.ts`, `submit-task-answer.use-case.ts`).
- Use-case инжектит **только порты** (никогда конкретные репозитории).
- Не выбрасывает исключений — все ошибки через `Result.fail`.
- Каждый use-case покрыт `*.use-case.spec.ts` (мок порта через `jasmine.createSpyObj`).

### Facades

Фасад — точка интеграции для одной "страницы/feature":

- Хранит `signal<AsyncState<T, E>>` для каждой управляемой операции.
- Публикует методы для UI (`load`, `refresh`, `submit`, ...).
- Внутри инжектит use-cases, при подписке мутирует сигналы через `loading()` → `success(data)` / `failure(err)`.
- При навигации — `init()` / `destroy()`-методы (вызываются из компонента в `ngOnInit`/`ngOnDestroy`).

```ts
@Injectable()
export class CourseDetailInfoService {
  private readonly courseDetailUIInfoService = inject(CourseDetailUIInfoService);
  // ...
  init(): void {
    this.loadCourseData();
    this.trackNavigation();
  }
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### UI-info services

UI-info — это **derived-state** поверх фасада: ничего не загружает, только выставляет `computed` сигналы для шаблонов.

```ts
readonly course = computed(() => {
  const state = this.courseDetail$();
  return isSuccess(state) ? state.data : undefined;
});
readonly loading = computed(() => isLoading(this.courseDetail$()));
```

UI-info сервисы регистрируются в `providers` страницы (не root), чтобы каждая страница имела свой инстанс — состояние не утекает между навигациями.

---

## Слой `infrastructure/`

### `repository/<module>/*.repository.ts`

Реализация порта. Делает HTTP через адаптер, держит `EntityCache<T>` где это нужно. Реализует контракт `implements XRepositoryPort`.

```ts
@Injectable({ providedIn: "root" })
export class CoursesRepository implements CoursesRepositoryPort {
  private readonly coursesAdapter = inject(CoursesHttpAdapter);
  private readonly eventBus = inject(EventBus);
  private readonly detailCache = new EntityCache<CourseDetail>();

  getCourseDetail(courseId: number): Observable<CourseDetail> {
    return this.detailCache.getOrFetch(courseId, () =>
      this.coursesAdapter.getCourseDetail(courseId)
    );
  }
}
```

### `adapters/<module>/*.adapter.ts`

Тонкий слой между репозиторием и HTTP: вызывает `apiService.get/post/...`, опционально маппит DTO в domain-модель через `class-transformer` или вручную. Большая часть кэйс-преобразований уже сделана `CamelcaseInterceptor`.

### `di/<module>.providers.ts`

`Provider[]`-массив для биндинга порта на реализацию:

```ts
// infrastructure/di/auth.providers.ts
export const AUTH_PROVIDERS: Provider[] = [
  { provide: AuthRepositoryPort, useExisting: AuthRepository },
];
```

`useExisting` — потому что репозиторий уже `providedIn: "root"`, повторно инстанцировать не нужно.

Все `*_PROVIDERS` подключаются в `app.config.ts` через spread-оператор.

---

## Слой `ui/`

### `routes/<area>/*.routes.ts`

`Routes`-массивы для лениво подгружаемых частей приложения:

```ts
// ui/routes/courses/course-detail.routes.ts
export const COURSE_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: CourseDetailComponent,
    resolve: { data: CoursesDetailResolver },
    children: [
      { path: "", component: CourseInfoComponent },
      { path: "lesson", loadChildren: () => import("./lesson.routes").then(m => m.LESSON_ROUTES) },
    ],
  },
];
```

### `pages/<area>/...` — страницы (smart-компоненты)

Потребляют фасады, прокидывают данные в widgets и primitives. Бизнес-логика — в фасаде, не в компоненте.

### `widgets/<name>/*` — переиспользуемые блоки

Виджет ≈ компонент, который используется в одном-двух местах в рамках одной/нескольких страниц (например, `news-card`, `vacancy-card`, `detail`, `program-links`). Имеет inputs/outputs, не знает про фасады напрямую — работает как dumb-компонент.

### `primitives/<name>/*` — атомы

Используются повсеместно (`input`, `button`, `modal`, `dropdown`, `tag`, `avatar`, `select`, `textarea`, `checkbox`, `switch`, `loader`, `tooltip`, `search`, `bar`, `icon`, `img-card`, `soon-card`, `file-item`, `file-upload-item`, `upload-file`, `autocomplete-input`, `avatar-control`).

### `services/`

Runtime-сервисы UI-уровня (синглтоны):

| Сервис                | Что                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `LoadingService`      | Глобальный лоадер (`mat-progress-bar` в `app.component.html`). Подписан на router events в `AppComponent`. |
| `SnackbarService`     | Toast-сообщения (`success` / `error` / `warning` / `info`).                                                |
| `NavService`          | Навигационные хелперы (back, breadcrumbs).                                                                 |
| `NotificationService` | Полл/sse уведомлений в шапке.                                                                              |

Каталог примитивов и виджетов — в [`docs/social-platform/ui-primitives.md`](ui-primitives.md) и [`docs/social-platform/ui-widgets.md`](ui-widgets.md).

---

## `utils/`

Маленькие чистые хелперы — функции и валидаторы без Angular DI:

```
utils/
  animate-content-height.ts
  calculateProgress.ts
  capitalize-string.ts
  dashboardItemBuilder.ts
  days-untit.ts            # опечатка: days-untit вместо days-until
  directionItemBuilder.ts
  expand-element.ts
  exponentialBackoff.ts    # exp-backoff для retry в ApiService
  export-file.ts           # обёртка над file-saver
  generate-options-list.ts
  getActionType.ts         # стиль для action-типа канбан-задачи (kanban)
  getPriorityType.ts       # стиль для приоритета канбан-задачи (kanban)
  hexToRgba.ts
  inviteToProjectMapper.ts
  is-html-text-truncated.ts
  optionalUrl.validator.ts
  responsive.ts
  stripNull.ts
  transformYear.ts
  video-url-embed.ts
  yearRangeValidators.ts
```

---

## Cross-cutting блоки

### `AsyncState<T, E>`

Дискриминированный union для состояния асинхронной операции — единый источник правды в фасадах.

```ts
type AsyncState<T, E = string> =
  | { readonly status: "initial" }
  | { readonly status: "loading"; readonly previous?: T }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "failure"; readonly error: E; readonly previous?: T };
```

Хелперы: `initial()`, `loading(previous?)`, `success(data)`, `failure(error, previous?)`, type guards `isInitial`, `isLoading`, `isSuccess`, `isFailure`.

`previous` — опциональное предыдущее значение, чтобы UI мог показать старые данные пока идёт refresh / при ошибке.

### `Result<T, E>`

Возвращается из use-case'ов — явное декларирование ошибок без `throw`:

```ts
type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Хелперы: `ok(value)`, `fail(error)`.

### `toAsyncState`

RxJS-оператор: `Observable<Result<T, E>> → Observable<AsyncState<T, E>>`. Автоматически:

- Стартует с `loading(previous)`.
- `Result.ok` → `success(value)`.
- `Result.fail` → `failure(error, previous)`.
- HTTP-ошибка (необработанная в use-case) → `failure(err.message ?? "Unknown error", previous)`.

```ts
// в фасаде:
this.useCase
  .execute(id)
  .pipe(toAsyncState(previousValue))
  .subscribe(state => this.signal.set(state));
```

### `EventBus`

Глобальный pub/sub на `Subject<DomainEvent>`. Используется чтобы один модуль уведомил другой о событии без прямой зависимости.

```ts
@Injectable({ providedIn: "root" })
export class EventBus {
  emit<T extends DomainEvent>(event: T): void;
  on<T extends DomainEvent>(type: T["type"]): Observable<T>;
}
```

Чистый pub/sub-примитив без сайд-эффектов и логирования. (Логирование было удалено — трассировка делается внешними подписчиками при необходимости.)

Типичный потребитель — репозиторий, который слушает событие из соседнего модуля и инвалидирует свой `EntityCache<T>`. Например, `ProjectRepository` слушает `SendVacancyResponse`, `AcceptVacancyResponse` и `RejectVacancyResponse` от vacancy-модуля и сбрасывает кеш проекта.

### `EntityCache<T>`

In-memory cache с `shareReplay(1)`. Без TTL — инвалидация только вручную (через `invalidate(id)` / `clear()`) или через подписку на `EventBus`.

```ts
private readonly detailCache = new EntityCache<CourseDetail>();
getCourseDetail(courseId: number): Observable<CourseDetail> {
  return this.detailCache.getOrFetch(courseId, () =>
    this.coursesAdapter.getCourseDetail(courseId)
  );
}
```

Применён к `Project`, `Vacancy`, `Program` и `Courses` репозиториям. Project/Vacancy чистят кеш по domain events, Courses чистит detail/structure cache после отправки ответа, Program кеширует `getOne()` без текущих event-listeners.

### `LoggingInterceptor` + `LoggerService`

См. [`docs/core/interceptors-providers.md`](../core/interceptors-providers.md). На каждый HTTP-запрос пишется строка с методом, URL, статусом, elapsed-временем; ошибки идут на уровне `error`, успехи — `debug`.

### `GlobalErrorHandler`

Регистрируется в `app.config.ts` как `{ provide: ErrorHandler, useClass: GlobalErrorHandlerService }`. Перехватывает все необработанные ошибки и Promise rejections, логирует через `LoggerService.error("[GlobalError] ...")`.

---

## DI и регистрация в `app.config.ts`

`projects/social_platform/src/app/app.config.ts` собирает воедино:

```ts
providers: [
  { provide: LOCALE_ID, useValue: "ru-RU" },
  importProvidersFrom(BrowserModule, ReactiveFormsModule, NgxMaskModule.forRoot(), MatProgressBarModule),

  // HTTP интерсепторы (порядок важен — см. ниже)
  { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },

  // Значения для DI-токенов из @corelib
  { provide: API_URL, useValue: environment.apiUrl },
  { provide: PRODUCTION, useValue: environment.production },

  // Глобальный обработчик ошибок
  { provide: ErrorHandler, useClass: GlobalErrorHandlerService },

  provideHttpClient(withInterceptorsFromDi()),
  provideRouter(APP_ROUTES, withRouterConfig({ onSameUrlNavigation: "reload" })),
  provideAnimations(),

  // Биндинг портов на реализации (по одному набору на модуль)
  ...AUTH_PROVIDERS,
  ...FEED_PROVIDERS,
  ...INDUSTRY_PROVIDERS,
  // ... всего ~20 наборов
],
```

### Порядок интерсепторов (фактический)

В коде регистрация:

1. `CamelcaseInterceptor` (первый)
2. `BearerTokenInterceptor` (второй)
3. `LoggingInterceptor` (третий)

HTTP-интерсепторы в Angular работают по принципу "matryoshka":

- На **запрос** идут в порядке регистрации: `Camelcase` → `Bearer` → `Logging` → HTTP.
- На **ответ** в обратном порядке: HTTP → `Logging` → `Bearer` → `Camelcase`.

Что это даёт:

- `Camelcase` преобразует тело запроса в snake_case ещё до того, как `Bearer` подпишет запрос. Тело и заголовок независимы — порядок не критичен.
- `Logging` стартует таймер последним перед уходом в HTTP, и логирует первым на ответе — таймер `started` максимально близок к реальному запросу.
- На ответе `Bearer` обрабатывает 401 **до** того, как `Camelcase` начнёт парсить тело. Это правильно: при 401 тело — `{detail: ...}`, его незачем парсить, нужно идти в refresh-флоу.

---

## Конвенции импортов

| Откуда                              | Что импортируем                                  | Alias                                                                           |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `domain/...`                        | модели, типы, порты                              | `@domain/<module>/...`                                                          |
| `api/<module>/...`                  | use-cases, facades, UI-info                      | `@api/<module>/...`                                                             |
| `infrastructure/...`                | **никогда** напрямую — только через DI           | —                                                                               |
| `ui/primitives`                     | атомы                                            | `@ui/primitives` (есть `index.ts`) или `@ui/primitives/<name>/<name>.component` |
| `ui/widgets/<name>`                 | конкретный widget                                | `@ui/widgets/<name>/<name>.component`                                           |
| `ui/services/<name>/<name>.service` | UI-сервисы                                       | `@ui/services/...`                                                              |
| `utils/<name>`                      | хелперы                                          | `@utils/<name>`                                                                 |
| Sub-проект `core`                   | services, interceptors, providers, pipes, models | `@corelib` (через public-api) или `@core/lib/...` (для непубличных)             |
| Sub-проект `ui`                     | layout-компоненты, primitives                    | `@uilib`                                                                        |
| Константы из `core/consts`          | списки, navigation, etc.                         | `@core/consts/...`                                                              |
| `environment`                       | базовые URL, флаги                               | `@environment`                                                                  |

---

## Структурные конвенции

| Что                          | Правило                                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Имена файлов                 | `kebab-case.<role>.ts` (`courses-list-info.service.ts`, `get-board.use-case.ts`, `kanban-task.component.ts`)                                                         |
| Имена классов                | `PascalCase` + суффикс роли (`CoursesListInfoService`, `GetBoardUseCase`, `KanbanTaskComponent`)                                                                     |
| Имена селекторов компонентов | `app-<kebab>` (большинство), `ui-<kebab>` для компонентов из `@uilib` (исключение). Для атрибутных директив — `[appIcon]`.                                           |
| Selector primitives          | без префикса фичи: `app-input`, `app-modal`, `app-dropdown`                                                                                                          |
| Selector widgets             | с префиксом фичи: `app-news-card`, `app-vacancy-card`, `app-program-links`                                                                                           |
| Тесты                        | `*.spec.ts` рядом с покрываемым файлом                                                                                                                               |
| `providers` страницы         | UI-info сервис и его facade — в `providers` компонента-страницы (не root)                                                                                            |
| `providers` корневой         | репозитории и use-cases — `providedIn: "root"`; биндинг порта на реализацию — в `infrastructure/di/<module>.providers.ts`                                            |
| Порядок Angular-импортов     | `@angular/*` → `rxjs` → `@corelib`/`@uilib` → `@domain` → `@api` → `@infrastructure` → `@ui` → `@utils` → `@environment` (условно — Prettier не форсит, ESLint тоже) |

---

## Точки входа

- `projects/social_platform/src/main.ts` — bootstrap с `bootstrapApplication(AppComponent, APP_CONFIG)`.
- `app.component.ts` — корневой компонент: `<mat-progress-bar>` (loading) + `<router-outlet>` + `<app-cookie-consent>`. Подписан на router events для отображения loading-bar.
- `app.config.ts` — все DI-провайдеры (см. выше).
- `app.routes.ts` — корневой `Routes` массив.

Подробнее про точки входа в роутинг и сами модули — в [`docs/PROJECT.md`](../PROJECT.md#точки-входа-в-роутинг) и в [`docs/modules/`](../modules/).
