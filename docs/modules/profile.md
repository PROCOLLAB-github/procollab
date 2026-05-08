<!-- @format -->

# Module: `profile`

Просмотр и редактирование профиля пользователя + лента новостей пользователя в его профиле. Сама модель `User` живёт в `domain/auth/user.model.ts` (см. [`docs/modules/auth.md`](auth.md)) — этот модуль работает с ней, а не определяет её. Собственная domain-модель тут только одна — `ProfileNews`.

## Назначение

- **Просмотр чужого/своего профиля** (`/office/profile/:id`) — карточка пользователя, навыки, достижения, новости, проекты, кнопки взаимодействия (подписаться/пригласить).
- **Редактирование своего профиля** (`/office/profile/:id/edit`) — пошаговая форма (5 шагов: main, education, experience, skills, achievements) с промежуточным сохранением.
- **Лента новостей пользователя** — встроена в детальную страницу профиля. На каждую новость отдельный URL `/office/profile/:id/news/:newsId` с резолвером.
- **Подсчёт прогресса заполнения** — `calculateProfileProgress(user)` (`@utils/calculateProgress`) считает процент по `core/consts/other/profile-fields.const.ts`.

> Edit-флоу не имеет своего use-case'а — мутации профиля идут через `AuthRepositoryPort.updateProfile()` / `updateAvatar()` / `updateOnboardingStage()`. Profile facade'ы edit/\* — это presentational state над общей формой и общим `AuthRepository`.

---

## Domain (`domain/profile/`)

### `profile-news.model.ts`

```ts
export class ProfileNews {
  id: number;
  name: string; // заголовок
  imageAddress: string; // URL обложки
  text: string; // тело
  datetimeCreated: string;
  datetimeUpdated: string;
  viewsCount: number;
  likesCount: number;
  files: FileModel[]; // прикреплённые файлы
  isUserLiked: boolean; // лайкнул ли текущий пользователь

  static default(): ProfileNews; // тестовая заглушка с фейковыми данными
}
```

### `ports/profile-news.repository.port.ts`

```ts
abstract class ProfileNewsRepositoryPort {
  fetchNews(id: number): Observable<ApiPagination<ProfileNews>>;
  fetchNewsDetail(userId: string, newsId: string): Observable<ProfileNews>;
  addNews(userId: string, obj: { text: string; files: string[] }): Observable<ProfileNews>;
  readNews(userId: number, newsIds: number[]): Observable<void[]>;
  delete(userId: string, newsId: number): Observable<void>;
  toggleLike(userId: string, newsId: number, state: boolean): Observable<void>;
  editNews(userId: string, newsId: number, newsItem: Partial<ProfileNews>): Observable<ProfileNews>;
}
```

DI-биндинг (`infrastructure/di/profile-news.providers.ts`):

```ts
{ provide: ProfileNewsRepositoryPort, useExisting: ProfileNewsRepository }
```

> Profile-edit (форма пользователя) **не** имеет своего port — он переиспользует `AuthRepositoryPort`. См. секцию "Edit flow".

---

## Use-cases (`api/profile/use-cases/`)

Все 7 — для profile-news (CRUD + lifecycle):

| Use-case                       | Параметры                                                        | Возвращает                                                |
| ------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `FetchProfileNewsUseCase`      | `userId: number`                                                 | `Observable<Result<ApiPagination<ProfileNews>, ...>>`     |
| `GetProfileNewsDetailUseCase`  | `userId, newsId: string`                                         | `Observable<Result<ProfileNews, ...>>`                    |
| `AddProfileNewsUseCase`        | `userId: string, obj: { text, files }`                           | `Observable<Result<ProfileNews, ...>>`                    |
| `EditProfileNewsUseCase`       | `userId: string, newsId: number, newsItem: Partial<ProfileNews>` | `Observable<Result<ProfileNews, ...>>`                    |
| `DeleteProfileNewsUseCase`     | `userId: string, newsId: number`                                 | `Observable<Result<void, ...>>`                           |
| `ToggleProfileNewsLikeUseCase` | `userId, newsId, state: boolean`                                 | `Observable<Result<void, ...>>`                           |
| `ReadProfileNewsUseCase`       | `userId: number, newsIds: number[]`                              | `Observable<Result<void[], ...>>` (отметка просмотренных) |

> `ReadProfileNewsUseCase` под капотом фильтрует уже-просмотренные через `StorageService` (`sessionStorage["readNews"]`), и шлёт на бэк только те, которых нет в кеше (`forkJoin`). Таким образом одна новость не отмечается прочитанной несколько раз.

---

## Facades (`api/profile/facades/`)

### Detail (просмотр)

| Facade                             | Provided | Что                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProfileDetailInfoService`         | страница | Загрузка/обновление данных детального просмотра. Дёргает `AuthInfoService.fetchUser()` через resolver, кладёт в `ProfileDetailUIInfoService.user`. Управляет лентой новостей (вызовы `*ProfileNewsUseCase`).                                                                                                                    |
| `ProfileDetailUIInfoService`       | страница | `user: signal<User \| undefined>`, `loggedUserId` (computed из `ProjectsDetailUIInfoService`), `isProfileEmpty`, `isProfileFill` (`progress < 100`), `directions` (для `<app-project-direction-card>` — навыки + достижения), `isShowModal` (модалка work info). Метод `applyInitProfile(data)` принимает данные из resolver'а. |
| `ProfileDetailProjectsInfoService` | страница | Загрузка списка проектов пользователя (для табов «проекты» / «подписки»).                                                                                                                                                                                                                                                       |

### Edit (редактирование)

Edit-флоу — пошаговый. На каждый шаг свой facade с локальным состоянием формы; общий `ProfileFormService` хранит `FormGroup` (root) с подформами.

| Facade                                                                           | Provided | Что                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProfileFormService`                                                             | `root`   | Корневой holder `FormGroup`. Сабмит → `AuthRepositoryPort.updateProfile()`. Хранит сигналы: `profileId`, `roles`, `inlineSpecs` (`Specialization[]`), `newPreferredIndustryTitle`. Готовые списки: `yearListEducation` (55 лет в обратном порядке), `educationStatusList`, `educationLevelList`, `achievementsYearList` (25 лет).                                                                                |
| `ProfileEditInfoService`                                                         | страница | Главный edit-facade: переключение между шагами (`editIndex` signal), обработка query-параметра `?step=...` для глубоких ссылок, сабмит формы (`profileFormSubmitting$ AsyncState`), модалка ошибки выбора скиллов (`isModalErrorSkillsChoose`, `isModalErrorSkillChooseText`). `userTypeMap: { 1: "member", 2: "mentor", 3: "expert", 4: "investor" }` — маппит `userType` число → ключ ролевого блока в `User`. |
| `ProfileEditMainInfoService` (фактически методы внутри `ProfileEditInfoService`) | страница | Поля главного шага.                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProfileEditEducationInfoService`                                                | страница | FormArray для `education[]`.                                                                                                                                                                                                                                                                                                                                                                                     |
| `ProfileEditExperienceInfoService`                                               | страница | FormArray для `workExperience[]`.                                                                                                                                                                                                                                                                                                                                                                                |
| `ProfileEditSkillsInfoService`                                                   | страница | Хранит выбранные скиллы (`SkillsBasketComponent` интеграция).                                                                                                                                                                                                                                                                                                                                                    |
| `ProfileEditAchievementsInfoService`                                             | страница | FormArray для `achievements[]`, плюс CRUD через legacy `ProfileService` (см. [`docs/modules/auth.md`](auth.md#legacy)).                                                                                                                                                                                                                                                                                          |

> Все edit-facade'ы инжектят `ProfileFormService.getForm()` (общая `FormGroup`) — чтобы каждый шаг работал со своим `FormArray`/`FormControl` внутри одной формы.

---

## Repository (`infrastructure/repository/profile/profile-news.repository.ts`)

`ProfileNewsRepository implements ProfileNewsRepositoryPort`. Делегирует HTTP в `ProfileNewsHttpAdapter`. Все ответы пропущены через `plainToInstance(ProfileNews, ...)`.

`readNews()` — единственный метод с особенным поведением: фильтрует через `StorageService.getItem<number[]>("readNews", sessionStorage)`, шлёт `forkJoin([setNewsViewed(id)...])` только для не-просмотренных, кеширует в session storage.

---

## HTTP endpoints (`infrastructure/adapters/profile/profile-news-http.adapter.ts`)

Все под `/auth/users` (то есть же URL что и `User`-эндпоинты — это API ходит к "пользовательским" новостям).

| Метод                               | HTTP   | URL                                              | Параметры              | Ответ                        |
| ----------------------------------- | ------ | ------------------------------------------------ | ---------------------- | ---------------------------- |
| `fetchNews(userId)`                 | GET    | `/auth/users/<userId>/news/?limit=10`            | —                      | `ApiPagination<ProfileNews>` |
| `fetchNewsDetail(userId, newsId)`   | GET    | `/auth/users/<userId>/news/<newsId>`             | —                      | `ProfileNews`                |
| `addNews(userId, obj)`              | POST   | `/auth/users/<userId>/news/`                     | `{ text, files }`      | `ProfileNews`                |
| `setNewsViewed(userId, newsId)`     | POST   | `/auth/users/<userId>/news/<newsId>/set_viewed/` | `{}`                   | `void`                       |
| `deleteNews(userId, newsId)`        | DELETE | `/auth/users/<userId>/news/<newsId>/`            | —                      | `void`                       |
| `toggleLike(userId, newsId, state)` | POST   | `/auth/users/<userId>/news/<newsId>/set_liked/`  | `{ is_liked }`         | `void`                       |
| `editNews(userId, newsId, item)`    | PATCH  | `/auth/users/<userId>/news/<newsId>/`            | `Partial<ProfileNews>` | `ProfileNews`                |

`fetchNewsDetail` — без trailing slash, остальные — с.

---

## Routes (`ui/routes/profile/profile-detail.routes.ts`)

Lazy-загружается из root-роутера через `office/profile/:id`.

```
/office/profile/:id            → DeatilComponent (виджет — universal header), data: { listType: "profile" }
                                  resolve: ProfileDetailResolver  → { user: User с progress }
  /                            → ProfileMainComponent  (default child)
  /news/:newsId                → ProfileNewsComponent
                                  resolve: ProfileMainResolver  → ProfileNews
```

`ProfileDetailResolver` дёргает `AuthInfoService.fetchUser(id)` и считает `progress` через `calculateProfileProgress`.

`ProfileMainResolver` использует `GetProfileNewsDetailUseCase`, при ошибке возвращает `new ProfileNews()` (пустую).

> `/office/profile/:id/edit` лежит **не здесь** — он отдельным роутом в `ui/routes/profile/` через `profile-edit.routes.ts` или подключается в root office routes напрямую (см. `app.routes.ts`); в текущей версии edit-роут защищён `ProfileEditRequiredGuard` (см. [`docs/core/guards-models.md`](../core/guards-models.md#profileeditrequiredguard)).

---

## Pages (`ui/pages/profile/`)

### `detail/`

| Page                        | Файл                                                       | Selector                 | Что                                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrapper                     | `widgets/detail/detail.component` (`<app-detail>`)         | `app-detail`             | Универсальный header, `listType: "profile"` — переключает контент в profile-режим. См. [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md#deatilcomponent-app-detail). |
| `ProfileMainComponent`      | `pages/profile/detail/main/main.component`                 | `app-main`               | Основной контент. Делит экран на 3 колонки через `<app-profile-left-side>` / `<app-profile-mid-side>` / `<app-profile-right-side>`.                                                         |
| `ProfileLeftSideComponent`  | `pages/profile/detail/main/components/profile-left-side`   | `app-profile-left-side`  | Аватар, имя, специальность, действия.                                                                                                                                                       |
| `ProfileMidSideComponent`   | `pages/profile/detail/main/components/profile-mid-side`    | `app-profile-mid-side`   | Биография, опыт, образование.                                                                                                                                                               |
| `ProfileRightSideComponent` | `pages/profile/detail/main/components/profile-right-side`  | `app-profile-right-side` | Проекты, подписки.                                                                                                                                                                          |
| `ProfileNewsComponent`      | `pages/profile/detail/profile-news/profile-news.component` | `app-profile-news`       | Детальная страница новости (отдельный роут `news/:newsId`).                                                                                                                                 |

### `edit/`

| Page                               | Файл                                                      | Selector                        | Что                                                                                                                                                                     |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProfileEditComponent`             | `pages/profile/edit/edit.component`                       | `app-profile-edit`              | Корневой компонент edit-флоу. Stepper через `<app-project-navigation>` (виджет, см. ui-widgets). Подключает текущий step-component через `*ngSwitch` или router-outlet. |
| `ProfileMainStepComponent`         | `pages/profile/edit/components/profile-main-step`         | `app-profile-main-step`         | Шаг "main": имя/фамилия/email/userType/birthday/specialty/город/телефон/о себе/аватар/обложка/ключевые скиллы.                                                          |
| `ProfileEducationStepComponent`    | `pages/profile/edit/components/profile-education-step`    | `app-profile-education-step`    | Шаг "education": FormArray из `Education[]` с `yearRangeValidators`.                                                                                                    |
| `ProfileExperienceStepComponent`   | `pages/profile/edit/components/profile-experience-step`   | `app-profile-experience-step`   | Шаг "experience": FormArray из `WorkExperience[]`.                                                                                                                      |
| `ProfileSkillsStepComponent`       | `pages/profile/edit/components/profile-skills-step`       | `app-profile-skills-step`       | Шаг "skills": через `<app-skills-group>` + `<app-skills-basket>`.                                                                                                       |
| `ProfileAchievementsStepComponent` | `pages/profile/edit/components/profile-achievements-step` | `app-profile-achievements-step` | Шаг "achievements": FormArray + CRUD через legacy `ProfileService` (одно достижение = одна заявка).                                                                     |

---

## Edit flow

1. Пользователь нажимает "Редактировать" → `/office/profile/:id/edit?step=main`.
2. `ProfileEditRequiredGuard` (`@core` guard) проверяет `auth.profile.id === paramId`. Если не — на `/office/profile/:id`.
3. `ProfileEditComponent.ngOnInit()` → `ProfileEditInfoService.initializationEditInfo()`:
   - Устанавливает заголовок навигации.
   - Подписывается на `route.queryParams.step`, переключает `editIndex`.
4. На каждом шаге активный step-component работает с `ProfileFormService.getForm()` через свою область.
5. Сабмит на любом шаге → `ProfileEditInfoService.onSubmit()`:
   - Валидация формы.
   - Преобразование birthday `dayjs(value, "DD.MM.YYYY").format("YYYY-MM-DD")` (см. memory `project_dev_merge_todo.md` — это место, где dev убрал `dayjs` парсинг; портирование пока не сделано).
   - `userTypeMap[userType]` — кладёт ролевой блок (`member`/`mentor`/`expert`/`investor`) на корневой уровень формы.
   - `phoneNumber.replace(/^([87])/, "+7")` — нормализация номера к `+7...` (тоже в TODO).
   - `authRepository.updateProfile(formValue)`.
   - При успехе обновляется `profile$` ReplaySubject в `AuthRepository`.

---

## Consumers

| Где                                                                     | Что использует                                                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `AuthRequiredGuard`, `ProfileEditRequiredGuard`                         | `AuthRepositoryPort.fetchProfile()` (см. [`docs/modules/auth.md`](auth.md)).                           |
| `widgets/detail`                                                        | работает с `ProfileDetailUIInfoService.user` для `listType: "profile"`.                                |
| `pages/feed`, `pages/program/detail/main`, `pages/projects/detail/info` | потребляют `ProfileNews` через `<app-news-card>` (для своих новостей; profile-news имеет такой же UI). |
| `pages/onboarding`                                                      | использует `AuthRepositoryPort.updateProfile()` / `updateOnboardingStage()`.                           |

---

## Известные проблемы

| Что                                                                                                                                                                    | Где                                                                  | Заметка                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Edit-флоу размазан между 5+ facade'ами и общим `ProfileFormService` без чёткого контракта между ними                                                                   | `api/profile/facades/edit/*`                                         | Архитектурный долг — централизовать на одном facade или явно разделить.                                 |
| `ProfileEditAchievementsInfoService` использует legacy `ProfileService` (не на use-case'ах)                                                                            | `api/profile/facades/edit/profile-edit-achievements-info.service.ts` | Перенести в use-case'ы (`AddAchievementUseCase`, `EditAchievementUseCase`, `DeleteAchievementUseCase`). |
| Edit flow не имеет своего `domain/profile/ports/profile.repository.port.ts` — мутации идут через `AuthRepositoryPort`                                                  | вся edit-цепочка                                                     | Решить — слить с auth (это всё пользователь) или разделить (profile = view-модель текущего юзера).      |
| `phoneNumber` нормализация и `birthday` форматирование — на стороне фронта                                                                                             | `ProfileEditInfoService.onSubmit`                                    | dev убрал эти преобразования (см. `memory/project_dev_merge_todo.md`); портирование незавершено.        |
| `ProfileNewsComponent` — единственная страница, использующая `ProfileMainResolver`; имя `ProfileMainResolver` сбивает с толку (это resolver новости, не main-страницы) | `pages/profile/detail/main/main.resolver.ts`                         | Переименовать в `ProfileNewsDetailResolver`.                                                            |
| `directionItemBuilder` создаёт массив с двумя жёстко зашитыми элементами ("навыки", "достижения")                                                                      | `ProfileDetailUIInfoService.initializationDirections`                | Это OK сейчас, но если добавятся секции — текущая жёсткая структура мешает.                             |
| `ProfileDetailUIInfoService` инжектит `ProjectsDetailUIInfoService` для `loggedUserId`                                                                                 | строка 8                                                             | Cross-module зависимость. Лучше вынести `loggedUserId` в общий `AuthInfoService`.                       |
| `static default()` на `ProfileNews` отдаёт реалистичные тестовые данные с битым URL                                                                                    | `domain/profile/profile-news.model.ts`                               | Используется только в тестах/стори; не критично.                                                        |
