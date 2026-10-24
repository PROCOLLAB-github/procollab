<!-- @format -->

# Module: `auth`

Аутентификация, регистрация, сброс пароля, подтверждение email, профиль текущего пользователя и роли. Это первый и единственный публичный модуль приложения — всё остальное живёт за `AuthRequiredGuard`.

## Назначение

- Логин (`/auth/login`) — email + пароль → JWT-токены в cookies.
- Регистрация (`/auth/register`) — двухшаговая форма (credentials → info), на финале пользователь получает письмо с подтверждением.
- Подтверждение email (`/auth/verification/email`, `/auth/verification`) — verification flow с counter'ом для resend.
- Сброс пароля (`/auth/reset_password/send_email`, `/auth/reset_password`, `/auth/reset_password/confirm`) — three-step flow.
- Хранение текущего профиля + ролей — в `ProfileInfoService` (`AsyncState` + signal). `AuthRepository` — pass-through HTTP без кеша.
- Скачивание CV пользователя.
- Связанные операции профиля: сохранение edit-формы через `SaveProfileUseCase`, подтверждение навыков через skills use-case'ы.

`logout` отдельной use-case'ом не вынесен — выполняется напрямую в `AuthInfoService.logout()` → `authRepository.logout()`.

---

## Domain models (`domain/auth/`)

### `user.model.ts`

| Класс              | Описание                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `User`             | Composition root: identity (`id`, `email`, `firstName`, `lastName`) + 4 вложенных блока — `personal: UserPersonal`, `roles: UserRolesData`, `relations: UserRelations`, `subscription: UserSubscription`.                                              |
| `UserPersonal`     | `onboardingStage`, `patronymic`, `aboutMe`, `birthday`, `avatar`, `links`, `coverImageAddress?`, `speciality`, `userType`, `v2Speciality`, `city`, `phoneNumber`, `region`, `isMospolytechStudent?`, `studyGroup?`.                                    |
| `UserRolesData`    | Опциональные ролевые блоки: `member?`, `mentor?`, `expert?`, `investor?` (с `usefulToProject`/`preferredIndustries`).                                                                                                                                  |
| `UserRelations`    | Коллекции и метаданные: `education[]`, `userLanguages[]`, `workExperience[]`, `achievements[]`, `programs[]`, `projects[]`, `subscribedProjects[]`, `keySkills`, `skills`, `skillsIds`, `progress?`, `isOnline`, `isActive`, `time*`, `verification*`. |
| `UserSubscription` | `isSubscribed`, `lastSubscribeDate`, `subscriptionDateOver`, `lastSubscriptionType`, `isAutopayAllowed`.                                                                                                                                               |
| `UserInput`        | Плоский input-shape для `updateProfile` — все поля опциональны (используется в фасадах при сборе command).                                                                                                                                             |
| `Achievement`      | id, title, status, year, files (`string[] \| FileModel[]`).                                                                                                                                                                                            |
| `Education`        | organizationName, entryYear, completionYear, description, educationStatus, educationLevel.                                                                                                                                                             |
| `WorkExperience`   | organizationName, entryYear, completionYear, description, jobPosition.                                                                                                                                                                                 |
| `UserLanguages`    | language, languageLevel.                                                                                                                                                                                                                               |
| `UserRole`         | id, name.                                                                                                                                                                                                                                              |

`User.doesCompleted()` — `personal.onboardingStage === null` (онбординг завершён).

> Бэк отдаёт плоский JSON — раскладку в nested-структуру делает маппер на границе адаптера (`AuthHttpAdapter` → `plainToInstance(User, raw)` + `@Type` декораторы подсекций).

### `tokens.model.ts`

```ts
class Tokens {
  access!: string;
  refresh!: string;
}
```

### `http.model.ts`

HTTP-модели живут в `@core/lib/models/auth/` (переиспользуются `TokenService` из core без cross-library импорта):

```ts
// core/src/lib/models/auth/http.model.ts
class LoginResponse {
  access!: string;
  refresh!: string;
}
class RegisterResponse extends LoginResponse {}

// core/src/lib/models/auth/refresh-response.model.ts
class RefreshResponse {
  access!: string;
  refresh!: string;
}
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
  // Auth flow
  login(data: LoginCommand): Observable<LoginResponse>;
  logout(): Observable<void>;
  register(data: RegisterCommand): Observable<RegisterResponse>;
  resendEmail(email: string): Observable<User>;
  resetPassword(email: string): Observable<void>;
  setPassword(password: string, token: string): Observable<void>;

  // Profile (no cache — каждый вызов идёт в HTTP)
  fetchUser(id: number): Observable<User>;
  fetchProfile(): Observable<User>;
  updateProfile(data: UserInput): Observable<User>;
  updateOnboardingStage(stage: number | null, userId: number): Observable<User>;
  updateAvatar(url: string, userId: number): Observable<User>;
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

---

## Facades (`api/auth/facades/`)

| Facade                | Provided                                    | Что хранит                                                                                                                                                                                                                                                                                                                                                                                                                                                | Ключевые методы                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthInfoService`     | `root`                                      | `profile`, `roles`, `changeableRoles` — computed-сигналы из `ProfileInfoService` (реэкспорт); `logout()` дёргает репозиторий + чистит кеши                                                                                                                                                                                                                                                                                                                | `fetchProfile()`, `fetchUser(id)`, `fetchLeaderProjects()`, `fetchUserRoles()`, `fetchChangeableRoles()`, `logout()`                                                                                                                            |
| `AuthUIInfoService`   | страница (`providers: [AuthUIInfoService]`) | `loginForm`, `registerForm`, `resetForm`, `passwordForm` ReactiveForms; сигналы `login$ / register$ / password$` (`AsyncState`); UI-флаги `showPassword`, `showPasswordRepeat`, `registerAgreement`, `ageAgreement`, `step` (`"credentials" \| "info"`), `credsSubmitInitiated`, `infoSubmitInitiated`; computed `loginIsSubmitting`, `errorWrongAuth`, `errorRequest`, `errorServer`, `registerIsSubmitting`, `isUserCreationModalError`, `isSubmitting` | `toggleShowPassword(section, type?)`, `prepareFormValues(form)` (форматирует birthday через dayjs `DD.MM.YYYY` → ISO)                                                                                                                           |
| `AuthLoginService`    | страница                                    | — (всё через `AuthUIInfoService`)                                                                                                                                                                                                                                                                                                                                                                                                                         | `onSubmit()` — валидирует форму, дёргает `LoginUseCase`, при `ok` сохраняет токены, навигирует на `AppRoutes.office.root()` (или `AppRoutes.program.root()` если `?redirect=program`)                                                           |
| `AuthRegisterService` | страница                                    | computed `serverErrors` (плоский массив строк из `validation_error`)                                                                                                                                                                                                                                                                                                                                                                                      | `onSendForm()` — валидирует, дёргает `RegisterUseCase`, при `ok` навигирует на `/auth/verification/email?adress=<email>`. `downloadPolicy()` — JS-загрузка `/assets/downloads/auth/shared/privacy_policy_2022.docx`                             |
| `AuthPasswordService` | страница                                    | `email` Observable из query                                                                                                                                                                                                                                                                                                                                                                                                                               | `init()`, `onSubmitResetPassword()`, `onSubmitSetPassword()` — three-step reset password                                                                                                                                                        |
| `AuthEmailService`    | страница                                    | `counter` (signal) для resend-таймера, `userEmail` (signal)                                                                                                                                                                                                                                                                                                                                                                                               | `initializationTokens()` — забирает access_token/refresh_token из query (используется на `/auth/verification` после magic-link), `initializationEmail()` — берёт `?adress=...` из query, `onResend()`, `initializationTimer()` — countdown 60→0 |

---

## Связанные операции профиля

Profile-edit хранит достижения в общей форме профиля и сохраняет их через `SaveProfileUseCase` (см. [`docs/modules/profile.md`](profile.md)). Подтверждение навыков вынесено в модуль skills: `ApproveSkillUseCase` / `UnapproveSkillUseCase` работают через `SkillsRepositoryPort`.

---

## Repository implementation (`infrastructure/repository/auth/auth.repository.ts`)

`AuthRepository implements AuthRepositoryPort`. `providedIn: "root"`.

**Особенности**:

- Чистый pass-through HTTP: **не хранит кеш**, не держит стримов. Кеширование вынесено в `ProfileInfoService` (сигналы `AsyncState`).
- Всё, что приходит с бэка как `User` — пропущено через `plainToInstance(User, json)` (`class-transformer`).
- `logout()` после успеха очищает токены через `tokenService.clearTokens()`.
- `updateOnboardingStage` / `updateAvatar` принимают `userId` параметром (не читают из стрима).
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

| Где                                                          | Что использует                                                                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `core/lib/services/tokens/token.service.ts`                  | `Tokens`, `RefreshResponse` (из `@core/public-api` — **чистый импорт, без долга**).                                                                          |
| `core/lib/services/validation/validation.service.ts`         | `PasswordValidationErrors` (через глубокий импорт — архитектурный долг).                                                                                     |
| `core/lib/guards/auth/auth-required.guard.ts`                | `AuthRepositoryPort.fetchProfile()` для проверки сессии (в core, не может импортировать `ProfileInfoService`).                                               |
| `core/lib/guards/profile-edit/profile-edit.guard.ts`         | `AuthRepositoryPort.fetchProfile()` для `profile.id` сравнения.                                                                                              |
| `core/lib/guards/kanban/kanban.guard.ts`                     | `AuthRepositoryPort.fetchProfile()` для `userId` сравнения.                                                                                                  |
| `core/lib/services/error/...`                                | использует `LoggerService` параллельно с auth-flow редиректами.                                                                                              |
| `app.component.ts`                                           | `tokenService.getTokens()` для решения redirect login/office (forkJoin ролей вынесен в `OfficeComponent.init` → `ProfileInfoService.ensureProfileLoaded()`). |
| `widgets/chat-window`, `widgets/detail`, `widgets/info-card` | `ProfileInfoService.profile` (сигнал) для отображения текущего пользователя.                                                                                 |
| `pages/profile/edit`                                         | `SaveProfileUseCase` для сохранения формы; `ProfileInfoService.refreshProfile()` после успеха.                                                               |
| `pages/onboarding`                                           | `AuthRepositoryPort.updateOnboardingStage(stage, userId)`.                                                                                                   |
| Любой компонент в `office` через `app-profile-control-panel` | `logout()` через `AuthInfoService.logout()`.                                                                                                                 |

---
