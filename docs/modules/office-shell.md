<!-- @format -->

# Module: `office-shell` (office / nav / error / onboarding + UI services)

Эта документация покрывает «оболочку» приложения — всё, что находится **вокруг** фичевых модулей: `OfficeComponent` shell с боковой навигацией, error-страницы, onboarding-флоу и UI-сервисы (loading / snackbar / nav / notification).

`office-shell` сам по себе не является доменным модулем — у него нет своих `domain/`, всё работает через композицию facade'ов из других модулей.

---

## `OfficeComponent` — shell приложения

`/office` — корневая страница за `AuthRequiredGuard`. Содержит:

- Боковую навигацию (`<app-nav>`) — слева.
- Шапку с уведомлениями + чатами (`<app-header>`) — сверху.
- `app-profile-control-panel` (`@uilib`) — кнопки логаута / приглашений / настроек.
- `<router-outlet>` для дочерних роутов (feed / projects / vacancies / program / chats / courses / members / profile / онбординг).
- `<app-cookie-consent>` (виджет) — баннер согласия, рендерится в `app.component.html` (root, не в `office.component`).

### Pages (`ui/pages/office/`)

| Page                          | Файл                                                                  | Selector                   | Что                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OfficeComponent`             | `pages/office/office.component.ts`                                    | `app-office`               | Shell. Provides `OfficeInfoService` + `OfficeUIInfoService`. На `init()` `OfficeInfoService` дёргает `industryRepository.getAll()` через `IndustryRepositoryPort` для прогрева кеша индустрий, `CheckUnreadsUseCase` для бейджа чатов, `ConnectChatUseCase` для WS, подписывается на `ObserveSetOnline/Offline` чтобы обновлять `ChatStateService.userOnlineStatusCache`, реагирует на инвайты через `AcceptInviteUseCase` / `RejectInviteUseCase`. |
| `NavComponent`                | `pages/office/nav/nav.component.ts`                                   | `app-nav`                  | Боковая навигация: список разделов (Новости / Проекты / Программы / Участники / Эксперты / Вакансии / Траектории) с активным `routerLinkActive` и mobile-burger меню.                                                                                                                                                                                                                                                                               |
| `DeleteConfirmComponent`      | `pages/office/delete-confirm/delete-confirm.component.ts`             | `app-delete-confirm`       | Универсальная confirm-модалка для удалений (используется через композицию).                                                                                                                                                                                                                                                                                                                                                                         |
| `ProgramSidebarCardComponent` | `pages/office/program-sidebar-card/program-sidebar-card.component.ts` | `app-program-sidebar-card` | Карточка программы в боковой панели.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `SnackbarComponent`           | `pages/office/snackbar/snackbar.component.ts`                         | `app-snackbar`             | Контейнер для всех snack-ов. Подписан на `SnackbarService.snacks` и анимирует появление/исчезание через `AnimationService`.                                                                                                                                                                                                                                                                                                                         |
| `AnimationService`            | `pages/office/snackbar/animation/animation.service.ts`                | (service)                  | Хелпер для анимаций snackbar.                                                                                                                                                                                                                                                                                                                                                                                                                       |

### Resolvers

- `OfficeResolver` — `GetMyInvitesUseCase` для бейджа количества приглашений в шапке.

### `api/office/facades/`

| Facade                | Provided        | Что                                                                                                               |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `OfficeInfoService`   | страница office | Координатор bootstrap'а — индустрии, чаты (connect + check unreads + observers), приглашения.                     |
| `OfficeUIInfoService` | страница office | UI-state shell'а: `invites: signal<Invite[]>`, `isMenuOpen` для mobile, computed для unread/notifications флагов. |

---

## Error pages

### Pages (`ui/pages/error/`)

| Page                     | Файл                                                 | Selector              | Что                                                             |
| ------------------------ | ---------------------------------------------------- | --------------------- | --------------------------------------------------------------- |
| `ErrorComponent`         | `pages/error/error.component.ts`                     | `app-error`           | Корневой layout error-страниц с фоном/логотипом.                |
| `ErrorNotFoundComponent` | `pages/error/not-found/error-not-found.component.ts` | `app-error-not-found` | Статическая страница 404.                                       |
| `ErrorCodeComponent`     | `pages/error/error-code/error-code.component.ts`     | `app-error-code`      | Универсальная страница для любых кодов (читает `:code` из URL). |

### Routes (`ui/routes/error/`)

```
/error/
  /                 → ErrorComponent (parent layout)
    /404            → ErrorNotFoundComponent
    /:code          → ErrorCodeComponent
```

`OFFICE_ROUTES` имеет fallback `{ path: "**", redirectTo: "/error/404" }` — все неизвестные пути внутри `/office` ведут сюда. Главный root-роутер (`app.routes.ts`) при попадании на не-`office`/`auth`/`error` тоже редиректит на `/error/404`.

`ErrorService` (см. [`docs/core/services.md`](../core/services.md#errorservice)) — сервис из core lib для программной навигации на эти страницы.

---

## Onboarding flow

Последовательность из 4 этапов после первой регистрации. Включается, если `User.onboardingStage !== null`. Лендится через `/office/onboarding/stage-{0,1,2,3}`.

### Pages (`ui/pages/onboarding/`)

| Stage | Page                            | Selector                     | Что заполняется                                                                                                       |
| ----- | ------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 0     | `OnboardingStageZeroComponent`  | `app-onboarding-stage-zero`  | Базовая информация профиля: фото, город, образование, опыт работы (FormArray).                                        |
| 1     | `OnboardingStageOneComponent`   | `app-onboarding-stage-one`   | Выбор специализации (через `<app-specializations-group>`). Resolver: `StageOneResolver` → `getSpecializationsNested`. |
| 2     | `OnboardingStageTwoComponent`   | `app-onboarding-stage-two`   | Выбор навыков (через `<app-skills-group>`). Resolver: `StageTwoResolver` → `getSkillsNested`.                         |
| 3     | `OnboardingStageThreeComponent` | `app-onboarding-stage-three` | Выбор типа пользователя (member / mentor / expert / investor). Подкомпонент `UserTypeCardComponent`.                  |

`OnboardingComponent` — обёртка с `<router-outlet>` + индикатор прогресса `0/4 → 4/4`.

### Routes (`ui/routes/onboarding/`)

```
/office/onboarding/
  ""           → OnboardingComponent
    /stage-0   → OnboardingStageZeroComponent
    /stage-1   → OnboardingStageOneComponent  (resolve: StageOneResolver)
    /stage-2   → OnboardingStageTwoComponent  (resolve: StageTwoResolver)
    /stage-3   → OnboardingStageThreeComponent
```

> Нет stage-4 (предположительно зарезервирован для будущих этапов).

### Facades (`api/onboarding/`)

| Facade                                                                  | Provided            | Что                                                                     |
| ----------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `OnboardingInfoService`                                                 | страница онбординга | Общий координатор: текущий шаг, переход между шагами, финальный сабмит. |
| `OnboardingStageZeroInfoService` + `OnboardingStageZeroUIInfoService`   | страница stage-0    | Большой шаг с FormArray для education + workExperience + поля профиля.  |
| `OnboardingStageOneInfoService` + `OnboardingStageOneUIInfoService`     | страница stage-1    | Выбор специализаций.                                                    |
| `OnboardingStageTwoInfoService` + `OnboardingStageTwoUIInfoService`     | страница stage-2    | Выбор навыков.                                                          |
| `OnboardingStageThreeInfoService` + `OnboardingStageThreeUIInfoService` | страница stage-3    | Выбор userType.                                                         |
| `OnboardingUIInfoService`                                               | страница онбординга | UI-state корневой.                                                      |

### `OnboardingService` (legacy state)

`api/onboarding/onboarding.service.ts` — общий state-service для `currentStage$` и `formValue$`. Сетевые операции онбординга уже вынесены в use-case'ы (`GetProfileUseCase`, `UpdateProfileUseCase`, `UpdateOnboardingStageUseCase`), но shared state всё ещё живёт в этом сервисе и используется stage-фасадами.

---

## UI services (`ui/services/`)

Глобальные runtime-сервисы UI-уровня. Все `providedIn: "root"`.

### `LoadingService` (`services/loading/`)

```ts
@Injectable({ providedIn: "root" })
class LoadingService {
  readonly isLoading$: Observable<boolean>;
  show(): void;
  hide(): void;
  toggle(): void;
}
```

Подключён к `<mat-progress-bar>` в `app.component.html`. `app.component.ts` подписан на `router.events` (`ResolveStart` → `show()`, `ResolveEnd` → `hide()` с `debounceTime(200)`).

### `SnackbarService` (`services/snackbar/`)

Toast-уведомления. Subject `snacks$` → `<app-snackbar>` подписан и рендерит.

```ts
class SnackbarService {
  readonly snacks: Observable<Snack>;
  success(text: string, options?: { timeout: number = 5000 }): void;
  error(text: string, options?): void;
  info(text: string, options?): void;
}

class Snack {
  id: string; // nanoid
  text: string;
  timeout: number; // мс
  type: "error" | "success" | "info";
}
```

### `NavService` (`services/nav/`)

Реактивный заголовок страницы (для `<app-nav>` хедера).

```ts
class NavService {
  readonly navTitle: Observable<string>; // distinctUntilChanged
  setNavTitle(title: string): void;
}
```

Используется facade'ами на `init()`: `MembersInfoService` → `setNavTitle("Участники")`, `ProfileEditInfoService` → `"Редактирование профиля"` и т. д.

### `NotificationService` (`services/notification/`)

In-memory список системных уведомлений. **Не активно используется** в текущей версии — `notifications: BehaviorSubject<Notification[]>` инициализирован пустым массивом, никто его не наполняет.

```ts
class NotificationService {
  notifications: BehaviorSubject<Notification[]>;
  hasNotifications: Observable<number>; // count of read notifications (странная семантика)
}
```

---

## Office routes (`ui/routes/office/`)

Корневая структура office shell:

```
/office/
  /onboarding/...   → lazy ./onboarding/onboarding.routes
  ""                → OfficeComponent (resolve: OfficeResolver)
    /               → redirect to /program
    /feed           → lazy ./feed/feed.routes
    /vacancies      → lazy ./vacancy/vacancies.routes
    /projects       → lazy ./projects/projects.routes
    /program        → lazy ./program/program.routes
    /chats          → lazy ./chat/chat.routes
    /courses        → lazy ./courses/courses.routes
    /members        → MembersComponent (resolve: MembersResolver)
    /profile/edit   → ProfileEditComponent
    /profile/:id    → lazy ./profile/profile-detail.routes
    /courses        → lazy ./courses/course-detail.routes  (дубликат, недостижим)
    /vacancies      → lazy ./vacancy/vacancies-detail.routes  (×2 — дубликат)
    /**             → redirect to /error/404
```

---

## Consumers

| Где                                           | Как использует                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Все pages                                     | `LoadingService` (через `app.component`), `SnackbarService` (для уведомлений), `NavService` (для заголовка). |
| `app.component.ts`                            | `LoadingService` подписан на router events.                                                                  |
| `widgets/header`, `app-profile-control-panel` | `NotificationService.hasNotifications` для бейджа.                                                           |
| `OfficeInfoService`                           | подписан на `ChatStateService.unread$` для бейджа чатов.                                                     |

---

## Известные проблемы

| Что                                                                                                      | Где                                                              | Заметка                                                             |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `NotificationService.hasNotifications` инвертированная семантика — считает прочитанные, не непрочитанные | `services/notification/notification.service.ts:hasNotifications` | Поправить фильтр на `!notification.readAt` или переименовать.       |
| `NotificationService` фактически пуст — `notifications` никем не наполняется                             | то же                                                            | Либо удалить сервис, либо реализовать получение уведомлений с бэка. |
| `SnackbarService.warning(...)` отсутствует, но потенциально нужен                                        | `services/snackbar/snackbar.service.ts`                          | Добавить если нужен.                                                |
| Дубликаты `/courses` и `/vacancies` в `OFFICE_ROUTES`                                                    | `ui/routes/office/office.routes.ts`                              | Убрать второй блок (он недостижим).                                 |
| Закомментированный `/chats` блок в OFFICE_ROUTES                                                         | то же                                                            | Удалить если не нужен.                                              |
| `OnboardingService` (legacy state) рядом с фасадами                                                      | `api/onboarding/onboarding.service.ts`                           | Перенести shared state в page-scoped onboarding facade/store.       |
| Stage-0 онбординга очень большой по объёму FormArray (education + workExperience)                        | `OnboardingStageZeroUIInfoService`                               | Разнести на под-шаги или выделить FormArray-сервис.                 |
| `OFFICE_ROUTES` — простыня из 13 lazy-загрузок                                                           | `office.routes.ts`                                               | Можно разбить на функциональные группы.                             |
| Закомментированный канбан в `detail.routes.ts` (см. [`docs/PROJECT.md`](../PROJECT.md))                  | проектные роуты, не office                                       | Документирован отдельно.                                            |
