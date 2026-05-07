<!-- @format -->

# `@corelib` — interceptors + providers

## Interceptors

Все три интерцептора живут в `projects/core/src/lib/interceptors/`, реэкспортируются через `interceptors/index.ts` и доступны как `@corelib`. Регистрируются в `app.config.ts` через `provideHttpClient(withInterceptorsFromDi())` + классические `HTTP_INTERCEPTORS` мульти-провайдеры.

| Файл                          | Класс                    | Что делает                                                                                  |
| ----------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| `bearer-token.interceptor.ts` | `BearerTokenInterceptor` | Добавляет `Authorization: Bearer <access>`, ловит `401`, рефрешит токены, повторяет запрос. |
| `camelcase.interceptor.ts`    | `CamelcaseInterceptor`   | camelCase → snake_case на запросе, snake_case → camelCase на ответе.                        |
| `logging.interceptor.ts`      | `LoggingInterceptor`     | Логирует метод, URL, статус и elapsed-время каждого запроса через `LoggerService`.          |

> Порядок регистрации в `app.config.ts` важен: `BearerTokenInterceptor` должен идти **раньше** `CamelcaseInterceptor`, иначе snake_case-преобразование запроса попадёт в логи без токена. `LoggingInterceptor` обычно ставится в самый конец, чтобы видеть финальный URL и статус.

---

### BearerTokenInterceptor

Полный жизненный цикл токенов на стороне HTTP. Решает 5 задач сразу:

1. Добавляет `Authorization: Bearer <access>` ко всем исходящим запросам, если токены есть.
2. Ставит `Accept: application/json` если он не задан и запрос не является blob-запросом.
3. Перехватывает `401` ответы и инициирует refresh.
4. Использует флаг `isRefreshing` + `BehaviorSubject` чтобы параллельные `401`-запросы дождались **одного** refresh, а не запускали несколько.
5. Если `401` пришёл с эндпоинта `/api/token/refresh` — refresh-токен сам мёртв, идёт `router.navigateByUrl("/auth/login")`.

**Распознавание blob-запросов**

```ts
const isBlobRequest =
  request.url.includes("/export") ||
  request.url.includes("/download") ||
  (request.headers.has("X-Request-Type") && request.headers.get("X-Request-Type") === "blob");
```

Для blob (`/export`, `/download`, явный `X-Request-Type: blob` хэдер) `Accept: application/json` **не ставится**, иначе сервер вернёт JSON-ошибку вместо файла.

**Refresh-флоу (`handle401`)**

- Если `isRefreshing === false`: ставим флаг, дёргаем `tokenService.refreshTokens()`, при успехе пушим новый access в `refreshTokenSubject`, сохраняем токены через `memTokens()`, повторяем исходный запрос с новым `Authorization`.
- Если `isRefreshing === true`: подписываемся на `refreshTokenSubject` (фильтр `token !== null`, `take(1)`) и повторяем запрос с уже новым токеном — без повторного вызова refresh.

**Известные нюансы**

- При неудаче refresh (`catchError`) `isRefreshing` сбрасывается, но запрос отдаёт исходную ошибку — пользователь не редиректится сам, должен кликнуть/перейти, чтобы сработал `AuthRequiredGuard`.
- Логика проверки blob-запросов и установки `Accept` дублируется в трёх местах (`intercept`, `handle401` ветка refresh, `handle401` ветка ожидания) — ровно тот же блок копипасты.

---

### CamelcaseInterceptor

Угол к различиям code-style: фронт работает на camelCase, бэк — на snake_case.

**Запрос**: если `request.body` существует и **не** `FormData` → `body = snakecaseKeys(body, { deep: true })`. `FormData` пропускается без преобразования (важно для `FileService.uploadFile` — иначе сломалось бы поле `file`).

**Ответ**: при `HttpResponse`:

- `body instanceof Blob` → возвращаем как есть (бинарь).
- `typeof body !== "object"` или `null` → возвращаем как есть (например, числа, строки, `204 No Content`).
- иначе → `body = camelcaseKeys(body, { deep: true })`.

При исключении в `camelcaseKeys` — `loggerService.warn` и оригинальный event возвращается. То есть API-ответ всегда доходит до подписчика, даже если ключи не удалось преобразовать.

---

### LoggingInterceptor

Простой timing-логгер. На каждый запрос фиксирует `started = Date.now()`, ждёт `HttpResponse`/`HttpErrorResponse` и пишет:

```
[HTTP] GET /api/projects/?page=1 200 134ms      // через logger.debug
[HTTP] POST /api/projects/ 500 2103ms <message> // через logger.error
```

DEBUG логи реально будут видны только когда `LoggerService.isDev === true` — см. известный баг с `@Inject("PRODUCTION")` в [`docs/core/services.md`](services.md#loggerservice).

---

## Providers

Файлы в `projects/core/src/lib/providers/`, реэкспорт — `providers/index.ts`, доступ — через `@corelib`.

Это **InjectionToken'ы** для значений, которые знает только конкретное приложение — URL'ы и production-флаг. Сами значения подставляются в `app.config.ts`:

```ts
{ provide: API_URL, useValue: environment.apiUrl },
{ provide: SKILLS_API_URL, useValue: environment.skillsApiUrl },
{ provide: PRODUCTION, useValue: environment.production },
```

| Токен            | Тип                       | Где используется                                                                     |
| ---------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| `API_URL`        | `InjectionToken<string>`  | `ApiService` ctor                                                                    |
| `SKILLS_API_URL` | `InjectionToken<string>`  | `SkillsApiService` ctor                                                              |
| `PRODUCTION`     | `InjectionToken<boolean>` | `TokenService` ctor (выбор cookie-опций), задумывался для `LoggerService` (см. баг). |

**Для библиотеки переиспользуемой между приложениями ещё нужны** (см. долг в `docs/core/services.md`):

| Какой токен                                                         | Сейчас                                                 | Нужно                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `WEBSOCKET_URL`                                                     | `WebsocketService` импортирует `@environment` напрямую | поднять в `core/lib/providers` и провайдить из `app.config.ts` |
| `WEBSOCKET_RECONNECT_INTERVAL` / `WEBSOCKET_RECONNECT_MAX_ATTEMPTS` | то же                                                  | то же                                                          |
