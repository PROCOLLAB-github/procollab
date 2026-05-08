<!-- @format -->

# Module: `auth`

Аутентификация, регистрация, сброс пароля, подтверждение email, профиль текущего пользователя и роли. Это первый и единственный публичный модуль приложения — всё остальное живёт за `AuthRequiredGuard`.

## Назначение

- Логин (`/auth/login`) — email + пароль → JWT-токены в cookies.
- Регистрация (`/auth/register`) — двухшаговая форма (credentials → info), на финале пользователь получает письмо с подтверждением.
- Подтверждение email (`/auth/verification/email`, `/auth/verification`) — verification flow с counter'ом для resend.
- Сброс пароля (`/auth/reset_password/send_email`, `/auth/reset_password`, `/auth/reset_password/confirm`) — three-step flow.
- Хранение текущего профиля + ролей пользователя в `AuthRepository` (`ReplaySubject`).
- Скачивание CV пользователя.
- Profile-service для achievements / skills approve (legacy, не на новом use-case паттерне).

`logout` отдельной use-case'ом не вынесен — выполняется напрямую в `AuthInfoService.logout()` → `authRepository.logout()`.

---

## Domain models (`domain/auth/`)

### `user.model.ts`

| Класс            | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`           | Полная модель пользователя — id, email, имена, аватар, ссылки, ключевые навыки + Skill[], `userType` (число), специальность, `v2Speciality`, города/регионы, телефон, программы, проекты, подписки, тип онбординга. Ролевые ветки: `member?`, `mentor?`, `expert?`, `investor?` (опциональные блоки с `usefulToProject`/`preferredIndustries`). Подписочный блок: `isSubscribed`, `lastSubscriptionType`, `subscriptionDateOver`, `isAutopayAllowed`. |
| `Achievement`    | id, title, status, year, files (`string[] \| FileModel[]`).                                                                                                                                                                                                                                                                                                                                                                                           |
| `Education`      | organizationName, entryYear, completionYear, description, educationStatus, educationLevel.                                                                                                                                                                                                                                                                                                                                                            |
| `WorkExperience` | organizationName, entryYear, completionYear, description, jobPosition.                                                                                                                                                                                                                                                                                                                                                                                |
| `UserLanguages`  | language, languageLevel.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `UserRole`       | id, name.                                                                                                                                                                                                                                                                                                                                                                                                                                             |

`User.doesCompleted()` — `onboardingStage === null` (онбординг завершён).
`User.default()` — статичный заглушка-конструктор для тестов.

### `tokens.model.ts`

```ts
class Tokens {
  access!: string;
  refresh!: string;
}
```

### `http.model.ts`

```ts
class LoginResponse {
  access!: string;
  refresh!: string;
}
class RefreshResponse {
  access!: string;
  refresh!: string;
}
class RegisterResponse extends LoginResponse {}
```

### `register.model.ts`

```ts
class RegisterRequest { firstName, lastName, birthday, email, password, repeatedPassword: string }
```

### `password-errors.model.ts`

```ts
interface PasswordValidationErrors extends ValidationErrors {
  passwordTooShort?: { requiredLength: number; actualLength: number };
  passwordNoUppercase?: { message: string };
  passwordNoLowercase?: { message: string };
  passwordNoNumber?: { message: string };
  passwordNoSpecialChar?: { message: string };
  passwordHasSpaces?: { message: string };
  passwordHasSequence?: { message: string };
  passwordHasRepeating?: { message: string };
}
```

### Commands

```ts
// commands/login.command.ts
interface LoginCommand {
  email: string | null;
  password: string | null;
}

// commands/register.command.ts
interface RegisterCommand {
  firstName;
  lastName;
  birthday;
  email;
  password: string;
}
```

### Results

```ts
// results/login.result.ts
interface LoginResult {
  tokens: LoginResponse;
}
type LoginError = { kind: "wrong_credentials" } | { kind: "unknown" };

// results/register.result.ts
type RegisterFieldErrors = Record<string, string[]>;
type RegisterError =
  | { kind: "server_error" }
  | { kind: "validation_error"; errors: RegisterFieldErrors }
  | { kind: "unknown"; cause?: unknown };

// results/password.result.ts
type PasswordError =
  | { kind: "server_error" }
  | { kind: "invalid_token" }
  | { kind: "unknown"; cause?: unknown };
```

---

## Repository port (`domain/auth/ports/auth.repository.port.ts`)

```ts
abstract class AuthRepositoryPort {
  // Стримы (у репозитория хранится ReplaySubject)
  readonly profile: Observable<User>;
  readonly roles: Observable<UserRole[]>;
  readonly changeableRoles: Observable<UserRole[]>;

  // Auth flow
  login(data: LoginCommand): Observable<LoginResponse>;
  logout(): Observable<void>;
  register(data: RegisterCommand): Observable<RegisterResponse>;
  resendEmail(email: string): Observable<User>;
  resetPassword(email: string): Observable<void>;
  setPassword(password: string, token: string): Observable<void>;

  // Profile
  fetchUser(id: number): Observable<User>;
  fetchProfile(): Observable<User>;
  updateProfile(data: Partial<User>): Observable<User>;
  updateOnboardingStage(stage: number | null): Observable<User>;
  updateAvatar(url: string): Observable<User>;
  fetchLeaderProjects(): Observable<ApiPagination<Project>>;

  // Roles
  fetchUserRoles(): Observable<UserRole[]>;
  fetchChangeableRoles(): Observable<UserRole[]>;

  // CV
  downloadCV(): Observable<Blob>;
}
```

DI-биндинг (см. `infrastructure/di/auth.providers.ts`):

```ts
{ provide: AuthRepositoryPort, useExisting: AuthRepository }
```

---

## Use-cases (`api/auth/use-cases/`)

| Use-case               | Команда / параметры               | Возвращает                                            | Ошибки                                                                                                         |
| ---------------------- | --------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `LoginUseCase`         | `command: LoginCommand`           | `Result<LoginResult, LoginError>`                     | `wrong_credentials` (HTTP 401), `unknown`                                                                      |
| `RegisterUseCase`      | `command: RegisterCommand`        | `Result<void, RegisterError>`                         | `server_error` (500), `validation_error` (400, прокидывает `error.error` как `RegisterFieldErrors`), `unknown` |
| `ResendEmailUseCase`   | `email: string`                   | `Result<void, { kind: "unknown" }>`                   | `unknown`                                                                                                      |
| `ResetPasswordUseCase` | `email: string`                   | `Result<void, { kind: "unknown" }>`                   | `unknown`                                                                                                      |
| `SetPasswordUseCase`   | `password: string, token: string` | `Result<void, { kind: "unknown"; cause? }>`           | `unknown` (с `cause`)                                                                                          |
| `DownloadCvUseCase`    | —                                 | `Result<Blob, { kind: "download_cv_error"; cause? }>` | `download_cv_error`                                                                                            |

Все use-case'ы покрыты `*.spec.ts` файлами рядом — мокают `AuthRepositoryPort` через `jasmine.createSpyObj`.

> Возможные refactor-цели: `ResendEmailUseCase` / `ResetPasswordUseCase` имеют узкий тип ошибки `{ kind: "unknown" }` — должны бы различать `400`/`500`/`network` для UX, но сейчас всё схлопывается в `unknown`.

---

## Facades (`api/auth/facades/`)

| Facade                | Provided                                    | Что хранит                                                                                                                                                                                                                                                                                                                                                                                                                                                | Ключевые методы                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthInfoService`     | `root`                                      | `profile`, `roles`, `changeableRoles` (стримы из репозитория)                                                                                                                                                                                                                                                                                                                                                                                             | `fetchProfile()`, `fetchUser(id)`, `fetchLeaderProjects()`, `fetchUserRoles()`, `fetchChangeableRoles()`, `logout()`                                                                                                                            |
| `AuthUIInfoService`   | страница (`providers: [AuthUIInfoService]`) | `loginForm`, `registerForm`, `resetForm`, `passwordForm` ReactiveForms; сигналы `login$ / register$ / password$` (`AsyncState`); UI-флаги `showPassword`, `showPasswordRepeat`, `registerAgreement`, `ageAgreement`, `step` (`"credentials" \| "info"`), `credsSubmitInitiated`, `infoSubmitInitiated`; computed `loginIsSubmitting`, `errorWrongAuth`, `errorRequest`, `errorServer`, `registerIsSubmitting`, `isUserCreationModalError`, `isSubmitting` | `toggleShowPassword(section, type?)`, `prepareFormValues(form)` (форматирует birthday через dayjs `DD.MM.YYYY` → ISO)                                                                                                                           |
| `AuthLoginService`    | страница                                    | — (всё через `AuthUIInfoService`)                                                                                                                                                                                                                                                                                                                                                                                                                         | `onSubmit()` — валидирует форму, дёргает `LoginUseCase`, при `ok` сохраняет токены, навигирует на `AppRoutes.office.root()` (или `AppRoutes.program.root()` если `?redirect=program`)                                                           |
| `AuthRegisterService` | страница                                    | computed `serverErrors` (плоский массив строк из `validation_error`)                                                                                                                                                                                                                                                                                                                                                                                      | `onSendForm()` — валидирует, дёргает `RegisterUseCase`, при `ok` навигирует на `/auth/verification/email?adress=<email>`. `downloadPolicy()` — JS-загрузка `/assets/downloads/auth/shared/privacy_policy_2022.docx`                             |
| `AuthPasswordService` | страница                                    | `email` Observable из query                                                                                                                                                                                                                                                                                                                                                                                                                               | `init()`, `onSubmitResetPassword()`, `onSubmitSetPassword()` — three-step reset password                                                                                                                                                        |
| `AuthEmailService`    | страница                                    | `counter` (signal) для resend-таймера, `userEmail` (signal)                                                                                                                                                                                                                                                                                                                                                                                               | `initializationTokens()` — забирает access_token/refresh_token из query (используется на `/auth/verification` после magic-link), `initializationEmail()` — берёт `?adress=...` из query, `onResend()`, `initializationTimer()` — countdown 60→0 |

> **Опечатка** в query параметре `?adress=` (вместо `?address=`) — сохраняется для совместимости с уже отправленными письмами.

---

## Legacy: `api/auth/profile.service.ts`

`ProfileService` (старый стиль, не на use-case'ах). Используется в profile-edit для **достижений** и **подтверждения навыков**:

| Метод                             | Endpoint                                               | Что                                        |
| --------------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| `getAchievements()`               | `GET /auth/users/achievements/`                        | Список достижений                          |
| `addAchievement(a)`               | `POST /auth/users/achievements/`                       | Создание                                   |
| `editAchievement(id, a)`          | `PUT /auth/users/achievement/<id>/`                    | (sic) endpoint в единственном числе        |
| `deleteAchievement(id)`           | `DELETE /auth/users/achievements/<id>/`                | Удаление                                   |
| `approveSkill(userId, skillId)`   | `POST /auth/users/<userId>/approve_skill/<skillId>/`   | Подтверждение навыка, возвращает `Approve` |
| `unApproveSkill(userId, skillId)` | `DELETE /auth/users/<userId>/approve_skill/<skillId>/` | Отмена подтверждения навыка                |

> Архитектурный долг: вынести в `domain/profile`/`api/profile` use-case'ы.

---

## Repository implementation (`infrastructure/repository/auth/auth.repository.ts`)

`AuthRepository implements AuthRepositoryPort`. `providedIn: "root"`.

**Особенности**:

- Хранит три `ReplaySubject<T>(1)`:
  - `profile$` — обновляется в `fetchProfile()`, `updateProfile()`, `updateOnboardingStage()`, `updateAvatar()`.
  - `roles$` — обновляется в `fetchUserRoles()`.
  - `changeableRoles$` — обновляется в `fetchChangeableRoles()`.
- Всё, что приходит с бэка как `User` — пропущено через `plainToInstance(User, json)` (`class-transformer`).
- `logout()` после успеха очищает токены через `tokenService.clearTokens()`.
- `updateOnboardingStage` / `updateAvatar` сначала тянут текущий профиль из стрима (`take(1)`), потом дёргают endpoint с `profile.id`.
- `fetchUserRoles` / `fetchChangeableRoles` принимают сырой формат `[[id, name], ...]` от бэка и трансформируют в `UserRole[]`.

Делегирует HTTP в `AuthHttpAdapter`.

---

## HTTP endpoints (`infrastructure/adapters/auth/auth-http.adapter.ts`)

Базовые URL: `/api/token`, `/auth`, `/auth/users`.

| Метод адаптера                         | HTTP  | URL                                              | Тело / параметры                               | Ответ                               |
| -------------------------------------- | ----- | ------------------------------------------------ | ---------------------------------------------- | ----------------------------------- |
| `login({email, password})`             | POST  | `/api/token/`                                    | `{ email, password }`                          | `LoginResponse { access, refresh }` |
| `logout()`                             | POST  | `/auth/logout/`                                  | `{ refreshToken }` (берётся из `TokenService`) | `void`                              |
| `register(data)`                       | POST  | `/auth/users/`                                   | `RegisterCommand`                              | `RegisterResponse`                  |
| `getProfile()`                         | GET   | `/auth/users/current/`                           | —                                              | `User`                              |
| `getUser(id)`                          | GET   | `/auth/users/<id>/`                              | —                                              | `User`                              |
| `saveProfile(p)`                       | PATCH | `/auth/users/<p.id>/`                            | `Partial<User>`                                | `User`                              |
| `saveAvatar(url, profileId)`           | PATCH | `/auth/users/<profileId>`                        | `{ avatar: url }`                              | `User`                              |
| `setOnboardingStage(stage, profileId)` | PUT   | `/auth/users/<profileId>/set_onboarding_stage/`  | `{ onboardingStage }`                          | `User`                              |
| `getUserRoles()`                       | GET   | `/auth/users/types/`                             | —                                              | `[[id, name], ...]`                 |
| `getChangeableRoles()`                 | GET   | `/auth/users/roles/`                             | —                                              | `[[id, name], ...]`                 |
| `getLeaderProjects()`                  | GET   | `/auth/users/projects/leader/`                   | —                                              | `ApiPagination<ProjectDto>`         |
| `downloadCV()`                         | GET   | `/auth/users/download_cv/` (responseType `blob`) | —                                              | `Blob`                              |
| `resetPassword(email)`                 | POST  | `/auth/reset_password/`                          | `{ email }`                                    | `void`                              |
| `setPassword(password, token)`         | POST  | `/auth/reset_password/confirm/`                  | `{ password, token }`                          | `void`                              |
| `resendEmail(email)`                   | POST  | `/auth/resend_email/`                            | `{ email }`                                    | `User`                              |

> `saveAvatar` — единственный endpoint без trailing slash (`/auth/users/<id>` без `/`). Нужно проверить — на бэке Django REST с `APPEND_SLASH = True` это безопасно, но на других серверах может ломать redirect.

---

## Routes (`ui/routes/auth/auth.routes.ts`)

```
/auth/                      → AuthComponent
  /                         → redirect to login
  /login                    → LoginComponent
  /register                 → RegisterComponent
  /verification/email       → EmailVerificationComponent
  /reset_password/send_email → ResetPasswordComponent
  /reset_password           → SetPasswordComponent
  /reset_password/confirm   → ConfirmPasswordResetComponent
/auth/verification          → ConfirmEmailComponent (вне AuthComponent shell)
```

> `/verification` (без префикса `/email`) лежит **вне** `AuthComponent` — это специальный роут для magic-link с access_token/refresh_token в query, его нельзя оборачивать в общий auth-layout.

Импорт в `app.routes.ts` через `loadChildren: () => import("./ui/routes/auth/auth.routes").then(c => c.AUTH_ROUTES)` (lazy).

---

## Pages (`ui/pages/auth/`)

| Page                            | Selector                     | Facade'ы / providers                                          | Что делает                                                                                                                                                                                                                                         |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthComponent`                 | `app-auth`                   | —                                                             | Корневой layout — обёртка `<router-outlet>` с общим фоном/логотипом.                                                                                                                                                                               |
| `LoginComponent`                | `app-login`                  | `AuthLoginService`, `AuthUIInfoService`, `TooltipInfoService` | Форма `email + password`, чекбокс «показать пароль», `forgot_password` ссылка, обработка `?redirect=program`.                                                                                                                                      |
| `RegisterComponent`             | `app-register`               | `AuthRegisterService`, `AuthUIInfoService`                    | Двухшаговая форма (`step: "credentials" \| "info"`). Step 1: email/password/repeat. Step 2: firstName/lastName/birthday. Обработка `validation_error` (`serverErrors` computed). Метод `downloadPolicy()` для скачивания соглашения через JS-клик. |
| `EmailVerificationComponent`    | `app-email-verification`     | `AuthEmailService`, `AuthUIInfoService`                       | Экран «отправили письмо», counter 60→0 для повторной отправки. Берёт `?adress=...` из query.                                                                                                                                                       |
| `ConfirmEmailComponent`         | `app-confirm-email`          | `AuthEmailService`                                            | Принимает `?access_token` + `?refresh_token` из URL (magic-link), сохраняет в cookie, навигирует в `/office`.                                                                                                                                      |
| `ResetPasswordComponent`        | `app-reset-password`         | `AuthPasswordService`, `AuthUIInfoService`                    | Форма `email`, отправляет ссылку на сброс.                                                                                                                                                                                                         |
| `SetPasswordComponent`          | `app-set-password`           | `AuthPasswordService`, `AuthUIInfoService`                    | Форма `password + repeat`, требует `?token=` в URL, иначе `LoggerService.error("Token is missing")`.                                                                                                                                               |
| `ConfirmPasswordResetComponent` | `app-confirm-password-reset` | `AuthPasswordService`                                         | Экран «письмо отправлено», `?email=...` из query.                                                                                                                                                                                                  |

---

## Consumers (за пределами модуля)

| Где                                                          | Что использует                                                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/lib/services/tokens/token.service.ts`                  | `Tokens`, `RefreshResponse` (через глубокий импорт — архитектурный долг).                                                                               |
| `core/lib/services/validation/validation.service.ts`         | `PasswordValidationErrors` (то же самое).                                                                                                               |
| `core/lib/guards/auth/auth-required.guard.ts`                | `AuthRepositoryPort` (`fetchProfile()` для проверки сессии).                                                                                            |
| `core/lib/guards/profile-edit/profile-edit.guard.ts`         | `AuthRepositoryPort` (для `profile.id` сравнения).                                                                                                      |
| `core/lib/services/error/...`                                | использует `LoggerService` параллельно с auth-flow редиректами.                                                                                         |
| `app.component.ts`                                           | `AuthRepositoryPort.fetchUserRoles()` + `fetchChangeableRoles()` в `forkJoin` при старте; `tokenService.getTokens()` для решения redirect login/office. |
| `widgets/header`, `widgets/detail`, `widgets/info-card`      | `AuthRepositoryPort.profile` (или через `AuthInfoService`) для отображения текущего пользователя.                                                       |
| `pages/profile/edit`                                         | `AuthRepositoryPort.updateProfile()`, `updateAvatar()`, `updateOnboardingStage()`.                                                                      |
| `pages/onboarding`                                           | `AuthRepositoryPort.updateOnboardingStage()`.                                                                                                           |
| Любой компонент в `office` через `app-profile-control-panel` | `logout()` через `AuthInfoService.logout()`.                                                                                                            |

---

## Известные проблемы

| Что                                                                         | Где                                                                      | Заметка                                                                                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `core` импортирует `domain/auth/*` напрямую                                 | `core/lib/services/{tokens,validation}`                                  | См. `docs/core/services.md`. Поднять разделяемые типы в `core/lib/models/auth/`.                                     |
| Опечатка `?adress=` в email-verification                                    | `AuthEmailService.initializationEmail`, `AuthRegisterService.onSendForm` | Не исправлять — сломает уже отправленные письма.                                                                     |
| `saveAvatar` URL без trailing slash                                         | `auth-http.adapter.ts:saveAvatar`                                        | На Django безопасно (APPEND_SLASH), на других серверах — потенциальный 301.                                          |
| `ResendEmailUseCase` / `ResetPasswordUseCase` имеют только `unknown` ошибку | `api/auth/use-cases/...`                                                 | Расширить до различения 400/500/network.                                                                             |
| `ProfileService` (legacy)                                                   | `api/auth/profile.service.ts`                                            | Перенести в `api/profile` use-case'ы.                                                                                |
| `Achievement.files: string[] \| FileModel[]`                                | `domain/auth/user.model.ts`                                              | Полиморфизм — на старых записях строки, на новых — `FileModel`. Унифицировать.                                       |
| `User.phoneNumber: number`                                                  | `domain/auth/user.model.ts`                                              | Должно быть `string` (международные номера, лидирующий `+`).                                                         |
| `User` — мегакласс с 30+ полями + 4 опциональных типа-роли блока            | `domain/auth/user.model.ts`                                              | Разнести: `User` (базовое) + `UserRolesData`/`UserSubscription`/`UserPersonal`. Сейчас всё одной плоской структурой. |
