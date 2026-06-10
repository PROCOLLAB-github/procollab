<!-- @format -->

# `@corelib` — services

Сервисы лежат в `projects/core/src/lib/services/`. Бо́льшая часть `providedIn: "root"` — то есть синглтоны на всё приложение и не требуют ручной регистрации в `providers`.

Импорт через alias:

```ts
import {
  ApiService,
  TokenService,
  LoggerService,
  ValidationService,
  SkillsApiService,
  YtExtractService,
} from "@corelib";

// Сервисы, которые НЕ экспортированы из public-api — импортируем по полному пути:
import { FileService } from "@core/lib/services/file/file.service";
import { WebsocketService } from "@core/lib/services/websockets/websocket.service";
import { ErrorService } from "@core/lib/services/error/error.service";
import { GlobalErrorHandlerService } from "@core/lib/services/error/global-error-handler.service";
```

| Сервис                                                    | Файл                                             | Provided                           | В `@corelib` | Зависит от                                    |
| --------------------------------------------------------- | ------------------------------------------------ | ---------------------------------- | ------------ | --------------------------------------------- |
| [`ApiService`](#apiservice)                               | `services/api/api.service.ts`                    | root                               | да           | `HttpClient`, `API_URL`                       |
| [`SkillsApiService`](#skillsapiservice)                   | `services/api/skillsApi.service.ts`              | root                               | да           | `HttpClient`,                                 |
| [`TokenService`](#tokenservice)                           | `services/tokens/token.service.ts`               | root                               | да           | `ApiService`, `PRODUCTION`, `js-cookie`       |
| [`LoggerService`](#loggerservice)                         | `services/logger/logger.service.ts`              | root                               | да           | — (опц. `"PRODUCTION"` — см. известный баг)   |
| [`ValidationService`](#validationservice)                 | `services/validation/validation.service.ts`      | root                               | да           | `dayjs` (`customParseFormat`, `relativeTime`) |
| [`YtExtractService`](#ytextractservice)                   | `services/yt-extract.service.ts`                 | root                               | да           | —                                             |
| [`FileService`](#fileservice)                             | `services/file/file.service.ts`                  | root                               | **нет**      | `ApiService`                                  |
| [`WebsocketService`](#websocketservice)                   | `services/websockets/websocket.service.ts`       | root                               | **нет**      | `TokenService`, `@environment`                |
| [`ErrorService`](#errorservice)                           | `services/error/error.service.ts`                | root                               | **нет**      | `Router`, `LoggerService`                     |
| [`GlobalErrorHandlerService`](#globalerrorhandlerservice) | `services/error/global-error-handler.service.ts` | не регистрируется (заменён Sentry) | **нет**      | `LoggerService`                               |

---

## ApiService

Базовый HTTP-клиент. Унифицирует работу с REST API: добавляет `apiUrl` к каждому запросу, оборачивает в `retry(exponentialBackoff(3))` и `first()`.

**Конструктор**

```ts
constructor(http: HttpClient, @Inject(API_URL) apiUrl: string)
```

**API**

| Метод       | Сигнатура                                    | Что возвращает        | Поведение                                               |
| ----------- | -------------------------------------------- | --------------------- | ------------------------------------------------------- |
| `get<T>`    | `(path, params?, options?) => Observable<T>` | Распарсенный JSON `T` | `HttpClient.get(apiUrl + path, { params, ...options })` |
| `getFile`   | `(path, params?) => Observable<Blob>`        | Бинарный `Blob`       | то же, но `responseType: "blob"`                        |
| `post<T>`   | `(path, body) => Observable<T>`              | JSON ответа           | `HttpClient.post<T>`                                    |
| `put<T>`    | `(path, body) => Observable<T>`              | JSON ответа           | `HttpClient.put<T>`                                     |
| `patch<T>`  | `(path, body) => Observable<T>`              | JSON ответа           | `HttpClient.patch`                                      |
| `delete<T>` | `(path, params?) => Observable<T>`           | JSON ответа           | `HttpClient.delete<T>`                                  |

**Поведение для всех методов**

- Все ответы пропущены через `retry(exponentialBackoff(RETRY_COUNT))` где `RETRY_COUNT = 3`. `exponentialBackoff` (см. `@utils/exponentialBackoff`) ретраит только если `error.status` НЕ в диапазоне `[400, 500)` — то есть 4xx ошибки клиента не ретраятся, а 5xx и сетевые ретраятся с задержкой `2^retryCount * 1000` мс.
- В конце `first()` — Observable автоматически завершается после первого значения.
- Никаких заголовков ApiService не ставит — авторизация (`Authorization: Bearer ...`) добавляется в `BearerTokenInterceptor`, преобразование snake_case ↔ camelCase — в `CamelCaseInterceptor`.

**Пример**

```ts
this.apiService.get<Project[]>("/projects/", new HttpParams().set("page", "1"));
this.apiService.post<Project>("/projects/", { name: "X" });
```

---

## TokenService

Хранит JWT в cookies (`js-cookie`), обновляет access-токен через refresh, очищает при logout. Работает в связке с `BearerTokenInterceptor`, который перехватывает `401` и дёргает `refreshTokens()`.

**Cookie-ключи зависят от хоста**

```ts
private get isDevStage(): boolean {
  return window.location.hostname === this.enviroment.apiUrl;
}
private get accessTokenKey(): string {
  return this.isDevStage ? "devAccessToken" : "accessToken";
}
private get refreshTokenKey(): string {
  return this.isDevStage ? "devRefreshToken" : "refreshToken";
}
```

Замысел — одновременно держать сессии prod и dev-stage в одном браузере, не затирая друг друга (см. [`docs/PROJECT.md` → Изоляция cookies](../PROJECT.md#изоляция-cookies-между-prod-и-dev-stage).

**API**

| Метод                                          | Что делает                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `getTokens(): Tokens \| null`                  | Возвращает `{ access, refresh }` если оба cookie существуют, иначе `null`.                                            |
| `memTokens(tokens)`                            | Сохраняет оба токена с `getCookieOptions()`.                                                                          |
| `clearTokens()`                                | Удаляет оба cookie.                                                                                                   |
| `refreshTokens(): Observable<RefreshResponse>` | `POST /api/token/refresh/` с текущим refresh-токеном; ответ преобразует `plainToInstance(RefreshResponse, json)`.     |
| `getCookieOptions(): CookieAttributes`         | В prod: `{ domain: ".procollab.ru", expires: +30d, secure: true, sameSite: "None" }`. В dev: `{}` (дефолты браузера). |

**Конструктор**

```ts
constructor(private apiService: ApiService, @Inject(PRODUCTION) private production: boolean)
```

**Известное замечание (архитектурное)**

`TokenService` импортирует `RefreshResponse` и `Tokens` напрямую из `projects/social_platform/src/app/domain/auth/*` — то есть `core` lib зависит от `social_platform` app. Это разворачивает логичное направление зависимостей. Чистое решение — поднять эти типы в `core` lib (например, `@core/lib/models/auth/`).

---

## LoggerService

Лёгкая обёртка над `console`. Уровни `DEBUG`, `INFO`, `WARN`, `ERROR`. Каждое сообщение префиксуется `[HH:MM:SS.sss] [LEVEL]`.

**API**

```ts
debug(message: string, data?: unknown): void   // только в dev
info(message: string, data?: unknown): void
warn(message: string, data?: unknown): void
error(message: string, error?: unknown): void
```

`debug` печатается только если `isDev = true`.

---

## ValidationService

Кастомные валидаторы для `Reactive Forms`. Большинство возвращают `ValidatorFn`.

| Метод                                 | Уровень       | Что валидирует                                                                                                                                                                                                     |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useMatchValidator(left, right)`      | `FormGroup`   | Совпадение значений двух полей; ставит `unMatch: true` на оба контрола и на группу. Используется для пары password / confirmPassword.                                                                              |
| `usePasswordValidator(minLength = 6)` | `FormControl` | Сила пароля. Возвращает `PasswordValidationErrors \| null` (по флагам — длина, верх/нижний регистр, цифра, спецсимвол, нет пробелов, нет последовательностей вроде `123`/`abc`, нет повторов символов > 2 подряд). |
| `useDateFormatValidator`              | `FormControl` | Парсит значение через `dayjs(value, "DD.MM.YYYY", true)`; возвращает `{ invalidDate: true }` если не распарсилось.                                                                                                 |
| `useAgeValidator(age = 14)`           | `FormControl` | Минимальный возраст по дате рождения.                                                                                                                                                                              |
| `useEmailValidator()`                 | `FormControl` | Email по строгому regexp.                                                                                                                                                                                          |
| `useLanguageValidator()`              | `FormControl` | Запрещает смешение русского и латиницы в одном значении.                                                                                                                                                           |
| `getFormValidation(form): boolean`    | `FormGroup`   | Маркирует все контролы как `markAsTouched()` и возвращает `form.valid` — типичный гард на сабмите.                                                                                                                 |

`dayjs` расширяется плагинами `customParseFormat` и `relativeTime` при импорте сервиса.

**Известное замечание**: импорт `PasswordValidationErrors` идёт из `projects/social_platform/src/app/domain/auth/...` — то же нарушение направления зависимостей, что и в `TokenService`.

---

## YtExtractService

Утилита для пользовательского контента: вытаскивает первую YouTube-ссылку из строки и превращает её в `embed`-URL.

```ts
transform(value: string): { extractedLink?: string; newText: string }
```

- Если ссылки нет → `{ newText: value }`.
- Если есть — извлекает 11-символьный videoId, формирует `https://www.youtube.com/embed/<id>`, возвращает остаток текста без ссылки.
- Поддерживаемые форматы: `youtube.com/watch?v=ID`, `youtu.be/ID`, с протоколом и без.

**Важно**: regex берёт первое совпадение, даёт жадный матч до конца строки (`youtu...\/.+`); если в тексте две ссылки или текст после ссылки — поведение специфическое (см. код).

---

## FileService

CRUD для загрузки файлов через основной API.

| Метод                                                        | URL                         | Что                                                                                              |
| ------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------ |
| `uploadFile(file: File): Observable<{ url: string }>`        | `POST /files/`              | Шлёт `FormData` с полем `file`. `CamelCaseInterceptor` пропускает `FormData` без преобразования. |
| `deleteFile(fileUrl: string): Observable<{ success: true }>` | `DELETE /files/?link=<url>` | URL передаётся как query-параметр `link`.                                                        |

Авторизация и retry автоматически через `ApiService` + `BearerTokenInterceptor`.

---

## WebsocketService

Лёгкая обёртка над `WebSocket` с переподключением и автоматической трансформацией ключей.

**Состояние**

```ts
public isConnected = false;
public readonly connectionLost$: Observable<void>; // фейл после исчерпания серии retry-попыток
private socket: WebSocket | null;
private messages$: Subject<MessageEvent>;
```

**API**

| Метод                                     | Что                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `connect(path: string): Observable<void>` | Устанавливает соединение по `environment.websocketUrl + path`. Передаёт access-токен из `TokenService.getTokens()` как Sec-WebSocket-Protocol `["Bearer", token]`. На `onmessage` пушит в `messages$`. На `onerror` — `observer.error()`, что запускает `retry({ count: environment.websocketReconnectionMaxAttempts, delay: environment.websocketReconnectionInterval, resetOnSuccess: true })`. |
| `send(type: string, content: any): void`  | Шлёт `JSON.stringify({ type, content: snakecaseKeys(content, { deep: true }) })`. Если сокет не `OPEN` — кидает `Error("WebSocket is not open.")`.                                                                                                                                                                                                                                                |
| `on<T>(type: string): Observable<T>`      | Парсит `message.data` как JSON, фильтрует по `message.type === type`, возвращает `camelcaseKeys(message.content, { deep: true })`.                                                                                                                                                                                                                                                                |
| `close(): void`                           | Закрывает сокет, обнуляет ссылку, ставит `isConnected = false`.                                                                                                                                                                                                                                                                                                                                   |

**`connectionLost$`** — публичный `Observable<void>`, эмитит при исчерпании серии retry-попыток. Переподключение при этом **не прекращается** (resilient reconnect: дальше реже, с бэкоффом, бесконечно) — сигнал нужен только для UX. На него подписан `ConnectionStatusToastService` (`@api/connection-status`), показывающий toast о потере связи.

**Известное замечание**: `WebsocketService` импортирует `@environment` напрямую — это `social_platform`. Если когда-нибудь захотим `core` сделать переиспользуемой между приложениями — параметризовать через DI-токены (по аналогии с `API_URL`).

---

## ErrorService

Навигация к страницам ошибок.

| Метод                               | Что                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `throwNotFount(): Promise<void>`    | `router.navigateByUrl("/error/" + ErrorCode.NOT_FOUND)`. **Опечатка в имени метода** (`throwNotFount` вместо `throwNotFound`) — оставлена, чтобы не ломать вызывающий код. |
| `throwServerError(): Promise<void>` | то же для `ErrorCode.SERVER_ERROR`.                                                                                                                                        |

Внутри обоих — `private throwError(type)` который ещё и логирует через `LoggerService.debug("Route Changed")`.

`ErrorCode` живёт в `core/lib/models/error/error-code.ts`.

---

## GlobalErrorHandlerService

Реализация `ErrorHandler` от Angular: ловит необработанные ошибки (sync + Promise rejections) и логирует через `LoggerService`. Инжектит только `LoggerService` (через `inject()`).

```ts
handleError(err: any): void {
  const error = err.rejection ? err.rejection : err;
  if (error instanceof Error) {
    this.logger.error(`[GlobalError] ${error.name}: ${error.message}`, error.stack);
  } else {
    this.logger.error("[GlobalError] Unknown error", error);
  }
}
```

> **Сейчас не зарегистрирован.** С внедрением observability `app.config.ts` использует `ErrorHandler` от Sentry (`createErrorHandler` из `@sentry/angular`), а `GlobalErrorHandlerService` остаётся в `core` как legacy/запасной вариант, но в провайдеры приложения не подключён. Сам Sentry инициализируется в `main.ts` через `initSentry()` (`app/sentry.config.ts`); конфиг observability разобран в [`docs/social-platform/architecture.md`](../social-platform/architecture.md#observability-sentry--globalerrorhandler).

---
