<!-- @format -->

# `@corelib` — guards + models

## Guards

Все гарды лежат в `projects/core/src/lib/guards/`. Это `CanActivateFn` (новый Angular 14+ API), не `Injectable`-классы. Используются в `ui/routes/*.routes.ts`.

| Guard                                                   | Файл                                          | Где используется                                                                             |
| ------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`AuthRequiredGuard`](#authrequiredguard)               | `guards/auth/auth-required.guard.ts`          | Все приватные роуты внутри `office`.                                                         |
| [`ProfileEditRequiredGuard`](#profileeditrequiredguard) | `guards/profile-edit/profile-edit.guard.ts`   | `/office/profile/:id/edit`.                                                                  |
| [`ProjectEditRequiredGuard`](#projecteditrequiredguard) | `guards/projects-edit/projects-edit.guard.ts` | `/office/projects/:projectId/edit`.                                                          |
| ~~`KanbanBoardGuard`~~                                  | `guards/kanban/kanban.guard.ts`               | **Не используется** — kanban-роуты закомментированы, см. [`docs/PROJECT.md`](../PROJECT.md). |

---

### AuthRequiredGuard

Гард на наличие сессии. Используется на корневом `office`-роуте.

**Логика**

1. Если `tokenService.getTokens() === null` → сразу `router.createUrlTree(["/auth/login"])`.
2. Иначе дёргает `authRepository.fetchProfile()`:
   - если профиль приходит → `true`;
   - если ошибка (401, network, etc.) → `router.navigateByUrl("/auth/login")` (важно: возвращается `Promise<boolean>` от `navigateByUrl`, не `UrlTree`).

**Зависимости**: `TokenService`, `AuthRepositoryPort`, `Router`.

---

### ProfileEditRequiredGuard

Не пускает редактировать чужой профиль.

**Логика**

```ts
const profileId = Number(route.paramMap.get("id"));
authRepository.fetchProfile().pipe(
  map(
    profile =>
      profile.id === profileId ? true : router.createUrlTree([`/office/profile/${profileId}/`]) // редирект на просмотр
  ),
  catchError(() => of(router.createUrlTree(["/auth/login"])))
);
```

Если `id` из URL не совпадает с `profile.id` — кидает на просмотр чужого профиля. Если профиль вообще не получили — на логин.

---

### ProjectEditRequiredGuard

Не пускает редактировать проект, который уже подан на партнёрскую программу.

**Логика**

```ts
const projectId = Number(route.paramMap.get("projectId"));
if (isNaN(projectId)) {
  return of(router.createUrlTree(["/office/projects/my"]));
}

projectRepository.getOne(projectId).pipe(
  map(project =>
    project.partnerProgram?.isSubmitted
      ? router.createUrlTree([`/office/projects/${projectId}`]) // редирект на просмотр
      : true
  ),
  catchError(() => of(router.createUrlTree([`/office/projects/${projectId}`])))
);
```

> Бизнес-правило: `partnerProgram.isSubmitted === true` означает «уже подал, редактировать нельзя» — пользователя кидает на страницу просмотра.

---

## Models

`projects/core/src/lib/models/` — **набор интерфейсов и enum'ов общего назначения**.

| Файл                     | Экспорт                                                      | Что                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `error/error-code.ts`    | `enum ErrorCode { NOT_FOUND = "404", SERVER_ERROR = "500" }` | Используется `ErrorService` для построения URL `/error/<code>`.                                                                              |
| `error/error-message.ts` | `enum ErrorMessage`                                          | Все текстовые сообщения об ошибках на русском, сгруппированы по категориям: AUTH, VALIDATION, USER, рейтинг проектов. Полная таблица — ниже. |
| `http.model.ts`          | `interface ApiError { detail: string }`                      | Типизация ошибок API: бэк отдаёт `{ detail: "..." }` для 4xx.                                                                                |     |

### ErrorMessage — все значения

| Ключ                           | Текст                                                          |
| ------------------------------ | -------------------------------------------------------------- |
| `AUTH_EMAIL_EXIST`             | Аккаунт с таким email уже зарегистрирован                      |
| `AUTH_WRONG_AUTH`              | Неправильный логин или пароль                                  |
| `AUTH_WRONG_PASSWORD`          | Неправильный пароль                                            |
| `AUTH_EMAIL_NOT_EXIST`         | Аккаунт с таким email не зарегистрирован                       |
| `VALIDATION_TOO_LONG`          | Максимальная длина:                                            |
| `VALIDATION_TOO_SHORT`         | Минимальная длина:                                             |
| `VALIDATION_REQUIRED`          | Обязательное поле                                              |
| `MINIMAL_AGE`                  | Минимальный возраст                                            |
| `MAXIMAL_AGE`                  | Максимальный возраст                                           |
| `INVALID_DATE`                 | Неправильный формат даты                                       |
| `VALIDATION_LANGUAGE`          | Используйте символы кириллического алфавита                    |
| `VALIDATION_EMAIL`             | Введенное значение не соответствует формату email              |
| `VALIDATION_PASSWORD_UNMATCH`  | Пароли не совпадают                                            |
| `EMPTY_AVATAR`                 | Выберите фото для профиля                                      |
| `VALIDATION_PATTERN`           | Введите корректную ссылку, начинающуюся с http:// или https:// |
| `USER_NOT_EXISTING`            | По данной ссылке пользователь не найден                        |
| `USER_IS_LEADER`               | Пользователь является лидером проекта                          |
| `USER_IS_MEMBER`               | Пользователь уже является участником проекта                   |
| `VALIDATION_PROFILE_LINK`      | Введенное значение не соответствует формату ссылки на профиль  |
| `VALIDATION_UNFILLED_CRITERIA` | Не все критерии заполнены                                      |
