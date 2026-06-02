<!-- @format -->

# Procollab — фронтенд-воркспейс

Angular-монорепозиторий из трёх под-проектов: приложения `social_platform` и двух разделяемых библиотек (`core`, `ui`). Приложение деплоится в две среды: prod (с ветки `master`) и dev-stage (с ветки `dev`).

> Документация по конкретным модулям лежит в [`docs/modules/`](modules/), документация по слоям приложения — в [`docs/social-platform/`](social-platform/), cross-cutting API-сервисы описаны в [`docs/cross-cutting.md`](cross-cutting.md), документация по библиотеке `core` — в [`docs/core/`](core/), по библиотеке `ui` — в [`docs/uilib.md`](uilib.md). Этот файл — общая карта воркспейса.

---

## Стек

| Область                | Технология                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework              | Angular 20 (standalone components, signals, zoneless change detection, control-flow `@if/@for`)                                                                                                                                                                                                                                                                                                                                                                                       |
| Язык                   | TypeScript 5.9 (`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `strictTemplates`, `useDefineForClassFields: false`)                                                                                                                                                                                                                                                                                                                                            |
| Состояние              | Signals + собственный дискриминатор `AsyncState<T, E>` (`initial` / `loading` / `success` / `failure`)                                                                                                                                                                                                                                                                                                                                                                                |
| Async                  | RxJS 7.5                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| HTTP                   | `ApiService` поверх `HttpClient` + `BearerTokenInterceptor` + `CamelCaseInterceptor` + `LoggingInterceptor`                                                                                                                                                                                                                                                                                                                                                                           |
| Auth                   | JWT в cookies через `TokenService`; имена cookie-ключей переключаются между `accessToken`/`refreshToken` и `devAccessToken`/`devRefreshToken` в зависимости от hostname                                                                                                                                                                                                                                                                                                               |
| WebSocket              | `WebsocketService` с reconnect interval / max attempts из `environment`                                                                                                                                                                                                                                                                                                                                                                                                               |
| UI primitives          | `@angular/cdk` 20, `@angular/material` 20 (выборочные модули)                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Стили                  | SCSS + миксины из `styles/_responsive.scss` (`apply-desktop` ≥ 1000px, `apply-tablet` 750–999px, `apply-tablet-and-above` ≥ 750px)                                                                                                                                                                                                                                                                                                                                                    |
| Errors / observability | `LoggerService` (уровень + timestamp), `LoggingInterceptor`, `EventBus` для domain-событий; **Sentry** через `@sentry/angular`: `initSentry()` в `main.ts` + `createErrorHandler` как `ErrorHandler` в `app.config.ts` (`tracesSampleRate: 0.2`, `replaysOnErrorSampleRate: 1.0`); `ConnectionStatusToastService` показывает toast при потере WebSocket. Кастомный `GlobalErrorHandler` остаётся в `core`, но в `app.config.ts` больше не регистрируется — его заменил Sentry-handler |
| Сборка                 | Angular CLI 20 + esbuild-билдер `@angular/build:application`; ng-packagr 20 для библиотек                                                                                                                                                                                                                                                                                                                                                                                             |
| Тесты                  | Karma + Jasmine 4 (`karma.conf.js`). Приложение zoneless, но Karma-билдер всё ещё подключает `zone.js` / `zone.js/testing` в `polyfills`                                                                                                                                                                                                                                                                                                                                              |
| Lint / format          | ESLint **flat-config** (`eslint.config.mjs`) с `eslint-plugin-boundaries` (контроль зависимостей между слоями), Stylelint, Prettier; `precommit` запускает `lint:scss` и `lint:ts`                                                                                                                                                                                                                                                                                                    |
| SVG-спрайт             | `svg-sprite` собирает `assets/icons/symbol/svg/sprite.css.svg` из всех файлов в `assets/icons/svg/**/*.svg`                                                                                                                                                                                                                                                                                                                                                                           |
| Сторонние пакеты       | `dayjs`, `class-transformer`, `js-cookie`, `linkifyjs`, `nanoid`, `ng-click-outside`, `ngx-mask`, `ngx-image-cropper`, `ngx-autosize`, `file-saver`, `fuse.js`, `js-base64`, `camelcase-keys`, `snakecase-keys`, `@sentry/angular`                                                                                                                                                                                                                                                    |
| Node                   | `>=20` (см. `engines.node` в `package.json`)                                                                                                                                                                                                                                                                                                                                                                                                                                          |

---

## Под-проекты (`angular.json` → `projects`)

| Проект            | Тип         | Source root                    | Назначение                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ----------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `social_platform` | application | `projects/social_platform/src` | Веб-приложение для пользователей. Содержит всё, что лежит в `app/`: `domain`, `api`, `infrastructure`, `ui`, `utils`, плюс ассеты в `assets/` и шрифты. Это единственный application-проект; library-проекты собираются отдельно через `ng-packagr`.                                                                                                                                                                                                                          |
| `core`            | library     | `projects/core/src`            | Базовые сервисы и утилиты, которые в принципе могут переехать в любое Angular-приложение: `ApiService`, `TokenService`, HTTP-интерсепторы, пайпы, `LoggerService`, `GlobalErrorHandler`, `ValidationService`, `WebsocketService`, провайдеры (`PRODUCTION`, `API_URL`), guards (`auth-required`, `projects-edit`, `profile-edit`). Публичный API — `core/src/public-api.ts`, импортируется как `@corelib`. Константы (списки, навигация) лежат отдельно в `core/src/consts/`. |
| `ui`              | library     | `projects/ui/src`              | Layout-компоненты, которые шарятся между приложениями (sidebar, header, profile-info, profile-control-panel, invite-manage-card, subscription-plans), плюс маленький набор примитивов (`avatar`, `back`, `icon`). Публичный API — `ui/src/public-api.ts`, импортируется как `@uilib`; модели — через `uilib/models`.                                                                                                                                                          |

---

## TypeScript path aliases (`tsconfig.json` → `compilerOptions.paths`)

| Alias               | Указывает на                                               |
| ------------------- | ---------------------------------------------------------- |
| `@core/*`           | `projects/core/src/*`                                      |
| `@corelib`          | `projects/core/src/public-api.ts`                          |
| `@uilib`            | `projects/ui/src/public-api.ts`                            |
| `uilib/models`      | `projects/ui/src/models/*`                                 |
| `@domain/*`         | `projects/social_platform/src/app/domain/*`                |
| `@infrastructure/*` | `projects/social_platform/src/app/infrastructure/*`        |
| `@api/*`            | `projects/social_platform/src/app/api/*`                   |
| `@ui/*`             | `projects/social_platform/src/app/ui/*`                    |
| `@pages/*`          | `projects/social_platform/src/app/ui/pages/*`              |
| `@utils/*`          | `projects/social_platform/src/app/utils/*`                 |
| `@environment`      | `projects/social_platform/src/environments/environment.ts` |
| `core` / `ui`       | `dist/core` / `dist/ui` (сборочные артефакты библиотек)    |

---

## Слои приложения (`projects/social_platform/src/app/`)

```
domain/           чистые типы, модели, repository ports, domain events
api/              use-cases (одна операция = один класс) + facades + UI-info services
infrastructure/   реализации репозиториев (HTTP), DTO ↔ domain adapters, DI providers
ui/               routes, pages, widgets, primitives, ui-services (loading/snackbar/nav/notification)
utils/            маленькие чистые хелперы (валидаторы, форматтеры, file-export и т. п.)
```

Правила зависимостей:

```
ui  ─┬──▶ api ──▶ domain ◀── infrastructure
     └────────────▶ domain (только для типов)
```

Никто не импортирует `infrastructure` напрямую — он подключается DI-провайдерами (`infrastructure/di/<module>.providers.ts`), которые биндят порт к реализации.

### Подробнее по слоям

- **`domain/`** — каркас. На каждый домен (auth, project, vacancy, courses, …) есть папка с:
  - `*.model.ts` — TypeScript-интерфейсы и классы доменной модели;
  - `ports/*.repository.port.ts` — абстрактные классы (используются как DI-токены) с контрактом репозитория;
  - `events/*` — domain events (если используется EventBus);
  - `commands/`, `results/` — отдельные структуры команд/результатов use-case'ов в новых модулях.

- **`api/`** — оркестрация. На каждый домен:
  - `use-cases/<verb>.<entity>.use-case.ts` — один класс на одну операцию, инжектит `*RepositoryPort`, возвращает `Observable<T>` или `Observable<Result<T, E>>`;
  - `facades/*.service.ts` — фасады для UI: хранят `signal<AsyncState<T, E>>`, вызывают use-case'ы, обрабатывают результат;
  - `facades/ui/*.service.ts` — UI-info-сервисы: composed `computed` сигналы поверх фасадов (готовые boolean'ы для `@if`, отфильтрованные списки, форматированные тексты и т. п.).

- **`infrastructure/`**:
  - `repository/<module>/*` — реализации портов, делают HTTP через `ApiService`, держат `EntityCache<T>` где нужно;
  - `adapters/*` — трансформации DTO ↔ domain;
  - `di/<module>.providers.ts` — `Provider[]` массив, который биндит каждый порт к его реализации (`{ provide: XRepositoryPort, useExisting: XRepository }`).

- **`ui/`**:
  - `routes/<area>/*.routes.ts` — лениво подгружаемые группы роутов;
  - `pages/<area>/...` — страницы (smart-компоненты), потребляют фасады;
  - `widgets/*` — переиспользуемые блоки внутри `social_platform` (виджет ≈ используется в одном-двух местах);
  - `primitives/*` — атомы (input, button, modal, dropdown, …) — используются повсеместно;
  - `services/` — runtime-сервисы UI: `LoadingService`, `SnackbarService`, `NavService`, `NotificationService`.

### Cross-cutting блоки

| Блок                                   | Где                                                     | Что                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AsyncState<T, E>`                     | `domain/shared/async-state.ts`                          | Дискриминатор `{ status: "initial" \| "loading" \| "success" \| "failure" }` с хелперами `initial`, `loading`, `success`, `failure`, `isSuccess`, `isLoading`, `isFailure`. Единый источник правды для состояния асинхронных операций в фасадах.                                                                                                                                                                                          |
| `Result<T, E>`                         | `domain/shared/result.type.ts`                          | `ok(data)` / `fail(error)` для возврата из use-case'ов. Use-case никогда не бросает — всё через `Result`.                                                                                                                                                                                                                                                                                                                                 |
| `EventBus` + domain events             | `domain/<module>/events/*` + `infrastructure` listeners | Репозитории слушают доменные события и инвалидируют свой `EntityCache<T>`. Развязывает модули между собой.                                                                                                                                                                                                                                                                                                                                |
| `EntityCache<T>`                       | `infrastructure/repository/...`                         | In-memory cache с опциональным TTL и stale-while-revalidate. Без TTL — бесконечный кеш (ручная инвалидация). С TTL — после истечения отдаёт стухшие данные сразу и запускает фоновый re-fetch (дедуп через `inflight`). TTL заданы у `Courses.detailCache` (10 мин) и `Program` (5 мин); `Project`, `Vacancy`, `project-news`, `project-subscription`, `Courses.structureCache` — без TTL, инвалидация через `EventBus` / `invalidate()`. |
| `LoggingInterceptor` + `LoggerService` | `core/lib/interceptors`, `core/lib/services/logger`     | Структурированные логи с timestamp и уровнем; DEBUG только не в проде.                                                                                                                                                                                                                                                                                                                                                                    |
| `GlobalErrorHandler`                   | `core/lib/services/error`                               | Перехватывает необработанные ошибки и Promise rejections, логирует через `LoggerService.error("[GlobalError] ...")`. `ErrorService` и `NgZone` заинжекчены, но в текущем коде не используются.                                                                                                                                                                                                                                            |

---

## Окружения

`fileReplacements` в `angular.json` подменяет `environment.ts` → `environment.prod.ts` для конфигурации `production`.

| Ключ                               | dev (`environment.ts`)      | prod (`environment.prod.ts`) |
| ---------------------------------- | --------------------------- | ---------------------------- |
| `production`                       | `false`                     | `true`                       |
| `apiUrl`                           | `https://dev.procollab.ru`  | `https://api.procollab.ru`   |
| `websocketUrl`                     | `wss://dev.procollab.ru/ws` | `wss://api.procollab.ru/ws`  |
| `websocketReconnectionInterval`    | `500` мс                    | `5000` мс                    |
| `websocketReconnectionMaxAttempts` | `5`                         | `5`                          |
| `sentryDns`                        | общий DSN                   | общий DSN                    |

### Изоляция cookies между prod и dev-stage

`TokenService` (`projects/core/src/lib/services/tokens/token.service.ts`) выбирает имена cookie-ключей по hostname:

| Hostname           | Access cookie    | Refresh cookie    |
| ------------------ | ---------------- | ----------------- |
| `dev.procollab.ru` | `devAccessToken` | `devRefreshToken` |
| Любой другой       | `accessToken`    | `refreshToken`    |

Это позволяет одному разработчику быть залогиненным одновременно в prod и dev-stage в одном браузере без коллизий по cookie-куки. Прод-cookies дополнительно имеют `domain: ".procollab.ru"`, `secure: true`, `sameSite: "None"` и `expires` через 30 дней (см. `getCookieOptions()`); в dev cookies остаются на текущем хосте с дефолтами браузера.

---

## Сборка, запуск, тесты

```bash
npm run start:social        # ng serve social_platform --open
npm run build:social:dev    # build:sprite + ng build social_platform --configuration=development
npm run build:social:prod   # build:sprite + ng build social_platform --configuration=production
npm run build:pr            # alias для build:social:dev (используется CI для dev-stage)
npm run build:prod          # alias для build:social:prod (используется CI для prod)
npm run watch               # ng build --watch development

npm run test                # ng test (Karma + Jasmine, headed Chrome)
npm run test:ci             # ng test --browsers=Headless --no-watch

npm run lint:ts             # ESLint поверх projects/**/*.ts
npm run lint:scss           # Stylelint поверх projects/**/*.scss --fix
npm run format              # Prettier write
npm run format:check        # Prettier check

npm run build:sprite        # SVG-спрайт из src/assets/icons/svg/**/*.svg
npm run docs:json           # Compodoc JSON dump (legacy)
```

`precommit` (через пакет `pre-commit`): `lint:scss`, `lint:ts`. Hooks **не пропускаем** через `--no-verify` — если линтер падает, чиним причину.

`build:sprite` обязательный шаг перед сборкой: он собирает `assets/icons/symbol/svg/sprite.css.svg`, на который завязан `IconComponent` (через `<svg><use href="#..."/></svg>`).

---

## CI/CD

Два workflow в `.github/workflows/`:

| Файл             | Триггер                                            | Что делает                                                                                                                                      |
| ---------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `deploy.yml`     | `push` в `master` (или ручной `workflow_dispatch`) | `npm ci` → `format:check` → `lint:ts` → `build:prod` → `rsync` дистрибутива в `app.procollab.ru:/home/gh_deploy` (секрет `DEPLOY_KEY`).         |
| `deploy-dev.yml` | `push` в `dev`                                     | `npm ci` → `format:check` → `lint:ts` → `build:pr` → `rsync` дистрибутива в `dev.procollab.ru:/home/front/app` (секрет `DEPLOY_KEY_FRONT_DEV`). |

Отдельного PR-preview workflow нет — раньше был `pull_request.yml` с Netlify-превью, на ветке `dev` он удалён.

Если ломается `format:check` или `lint:ts` — деплой не пойдёт. Перед пушем в `dev` или PR в `master` локально гонять:

```bash
npm run format:check && npm run lint:ts && npm run build:pr
```

---

## Точки входа в роутинг

`projects/social_platform/src/app/app.routes.ts` — корневой `Routes` массив. Лениво подгружаемые группы лежат под `ui/routes/<area>/`:

- **`auth`** — публичные экраны (`ui/routes/auth/`): login, register, email verification, password reset.
- **`office`** — закрытый shell после логина (`ui/routes/office/`). Дочерние роуты:
  - `feed` — глобальная лента;
  - `members` — список участников платформы;
  - `vacancies` — список вакансий, детальная страница;
  - `chats` — список чатов и детальные чаты (личные + проектные);
  - `projects` — `dashboard`/`my`/`subscriptions`/`invites`/`all` списки + edit + детальная страница с детьми: `info`, `vacancies`, `team`, `work-section`, `chat`;
  - `program` — `all`, детальная страница (`main`, `projects`, `members`, `projects-rating`) и `register`;
  - `courses` — `all`, детальная страница с детьми: `info`, `lesson` (и дальнейшие lesson-children);
  - `onboarding` — flow первого захода (привязан к office shell, но грузится по своему пути).
- **`error`** — `404` и общая страница ошибки.

---
