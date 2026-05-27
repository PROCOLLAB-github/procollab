<!-- @format -->

# Cross-cutting API services

`projects/social_platform/src/app/api/` содержит **12 пакетов без собственного домена** — это утилиты, shell/onboarding facades и UI-state контейнеры, которые не вписываются в обычную схему `domain/<x>` + `api/<x>` + `infrastructure/<x>`. Документируются здесь скопом.

| Пакет               | Тип         | Назначение                   |
| ------------------- | ----------- | ---------------------------- |
| [`advert`](#advert) | HTTP-сервис | Маркетинговые объявления (`/ |

`). | | [`analytics`](#analytics) | сервис | Загрузка Yandex Metrika + Mail.ru counter (после согласия cookie). | | [`expand`](#expand) | UI-state | Сигналы раскрытия описаний/списков (description / skills / achievements / vacancies / members / projects / programs / links / education / languages / workExperience). | | [`export-file`](#export-file) | HTTP + facade | Экспорт XLSX (`exportProgramRates`/`exportAllProjects`/`exportSubmittedProjects`) + facade для UI. | | [`paths`](#paths) | utility | `AppRoutes`(типизированные builders),`PathsService`(computed-флаги по URL),`NavigationService` (хелперы навигации). | | [`searches`](#searches) | UI-state | Inline-поиск специализаций для фильтра members. | | [`storage`](#storage) | utility | Тонкая обёртка над `localStorage`/`sessionStorage` с авто-сериализацией JSON. | | [`swipe`](#swipe) | UI-helper | Обработка touch-свайпов для фильтр-модалки на мобильных. | | [`toggle-fields`](#toggle-fields) | UI-state | Один сигнал `showInputFields` для условного показа полей в формах. | | [`tooltip`](#tooltip) | UI-state | Сигналы видимости tooltip'ов (14 полей с `isHint\*Visible`+ общий`isTooltipVisible`). | | [`office`](#office) | facade | Office shell facades (документированы в [`docs/modules/office-shell.md`](modules/office-shell.md)). | | [`onboarding`](#onboarding) | facades | Onboarding flow facades (документированы в [`docs/modules/office-shell.md`](modules/office-shell.md)). |

`office` и `onboarding` уже покрыты в `office-shell.md` — здесь только указаны для полноты.

---

## advert

`api/advert/advert.service.ts` — **HTTP-сервис старого стиля** (без use-case'ов), `providedIn: "root"`. Загружает маркетинговые "новости" через основной API.

| Метод              | HTTP | URL                 | Возвращает                                                                |
| ------------------ | ---- | ------------------- | ------------------------------------------------------------------------- |
| `getAll()`         | GET  | `/news/`            | `New[]` (см. [`docs/modules/news.md`](modules/news.md#domain-domainnews)) |
| `getOne(advertId)` | GET  | `/news/<advertId>/` | `New`                                                                     |

Используется в `pages/feed/open-vacancy/advert-card/...` для отображения маркетинговых блоков в ленте.

---

## analytics

`api/analytics/analytics.service.ts` — `providedIn: "root"`. Лениво подгружает скрипты Yandex Metrika и Mail.ru counter **только** на проде (`window.location.hostname === "app.procollab.ru"`).

```ts
class AnalyticsService {
  private loaded = false;
  loadAnalytics(): void;
}
```

**Логика**:

- Гард `if (window.location.hostname !== "app.procollab.ru") return;` — на dev-stage и localhost трекинг не запускается.
- Запускает Yandex Metrika с tagId `91871365` (clickmap, trackLinks, accurateTrackBounce, webvisor, trackHash).
- Загружает Mail.ru counter с `id: "3622531"`.
- Если URL ровно `/auth/register`, загружает дополнительный Mail.ru counter `3543687` для конверсии регистраций.
- Использует флаг `loaded` чтобы не запускать дважды.

Вызывается из [`<app-cookie-consent>`](modules/news.md#cookieconsentcomponent) после нажатия "принять" пользователем.

---

## expand

`api/expand/expand.service.ts` — `@Injectable()` (**page-scoped**). Контейнер для всех "раскрыть/свернуть" сигналов в детальных страницах; провайдится в `providers: []` каждой detail-страницы (`profile/main`, `projects/info|team|vacancies`, `program/main`, `vacancies/detail`), чтобы состояние не утекало между навигациями. Обёртка над `expandElement` хелпером (`@utils/expand-element`).

**Сигналы** (все `signal<boolean>`):

```ts
readFullDescription, descriptionExpandable;
readFullSkills, skillsExpandable;
readAllAchievements, readAllVacancies, readAllMembers;
readAllProjects, readAllPrograms, readAllLinks;
readAllEducation, readAllLanguages, readAllWorkExperience;
```

**Методы**:

```ts
onExpand(type: "description" | "skills", elem: HTMLElement, expandedClass: string, isExpanded: boolean): void;
checkExpandable(type: "description" | "skills", hasText: boolean, descEl?: ElementRef): void;
```

`onExpand` дёргает CSS-классы для анимации высоты + переключает signal. `checkExpandable` проверяет `el.scrollHeight > el.clientHeight` чтобы решить, показывать ли кнопку «подробнее».

---

## export-file

Два сервиса:

- **`api/export-file/export-file.service.ts`** (`ExportFileService`) — HTTP-вызовы за blob'ами.
- **`api/export-file/facades/export-file-info.service.ts`** (`ExportFileInfoService`) — page-scoped facade.

### `ExportFileService` (root)

| Метод                                | HTTP | URL                                                         | Что                      |
| ------------------------------------ | ---- | ----------------------------------------------------------- | ------------------------ |
| `exportProgramRates(programId)`      | GET  | `/programs/<programId>/export-rates/` (responseType `blob`) | Excel с оценками         |
| `exportAllProjects(programId)`       | GET  | `/programs/<programId>/export-projects/`                    | Excel со всеми проектами |
| `exportSubmittedProjects(programId)` | GET  | `/programs/<programId>/export-projects/?only_submitted=1`   | Excel только поданных    |

Возвращают `Observable<Blob>` через `apiService.getFile(...)` (см. [`docs/core/services.md`](core/services.md#apiservice)).

### `ExportFileInfoService` (page)

Facade для UI с `loadingExports$ AsyncState<void>` сигналом. Дёргает `ExportFileService`, через `saveFile()` (`@utils/export-file`) сохраняет blob на диск с правильным именем (`projects-<programName>-<DD.MM.YYYY>.xlsx` и т.п.).

Используется в `pages/program/detail/list` для кнопок «выгрузка проектов / оценок / решений».

---

## paths

Три файла в `api/paths/`:

### `app-routes.ts` — типизированные URL-builders

```ts
export const AppRoutes = {
  office: {
    root: () => "/office",
    feed: () => "/office/feed",
    chats: () => "/office/chats",
    members: () => "/office/members",
    vacancies: () => "/office/vacancies",
  },
  auth: {
    login: () => "/auth/login",
    verifyEmail: () => "/auth/verification/email",
    resetPasswordConfirm: () => "/auth/reset_password/confirm",
  },
  courses: {
    list: () => "/office/courses/all",
    detail: (courseId: number | string) => `/office/courses/${courseId}`,
  },
  projects: {
    all: () => "/office/projects/all",
    my: () => "/office/projects/my",
    detail: projectId => `/office/projects/${projectId}`,
    edit: projectId => `/office/projects/${projectId}/edit`,
    chat: projectId => `/office/projects/${projectId}/chat`,
  },
  program: {
    root: () => "/office/program",
    list: () => "/office/program/all",
    detail: programId => `/office/program/${programId}`,
    register: programId => `/office/program/${programId}/register`,
  },
  chats: { detail: chatId => `/office/chats/${chatId}` },
  profile: { detail: userId => `/office/profile/${userId}` },
  members: { root: () => "/office/members" },
  onboarding: {
    root: () => "/office/onboarding",
    stage: (n: number) => `/office/onboarding/stage-${n}`,
  },
} as const;
```

Используется в **typescript коде** (`router.navigateByUrl`, resolvers, facades). В шаблонах (`routerLink`) — пока хардкод-строки; миграция отдельно.

### `PathsService`

Реактивный URL-state через `signal`:

```ts
@Injectable({ providedIn: "root" })
class PathsService {
  readonly url = signal(this.router.url); // обновляется на NavigationEnd
  readonly basePath = signal("/office/");
  readonly isAllVacanciesPage = computed(() => this.url().includes("/vacancies/all"));
  readonly isMyVacanciesPage = computed(() => this.url().includes("/vacancies/my"));
}
```

> Только два computed-флага на текущий момент. Используется в `pages/vacancies` для разделения списков all/my без отдельных компонентов.

### `NavigationService`

Маленький хелпер для типичных навигаций — пока с одним методом:

```ts
profileRedirect(profileId?: number): void;
```

Используется в profile-edit после сохранения для возврата к деталям.

---

## searches

`api/searches/searches.service.ts` — `providedIn: "root"`. Inline-поиск **специализаций** для autocomplete-фильтра.

```ts
class SearchesService {
  readonly inlineSpecs: signal<Specialization[]>;

  onSelectSpec(form: FormGroup, speciality: Specialization): void; // patch формы
  onSearchSpec(query: string): void; // дёргает getSpecializationsInline(query, 1000, 0)
}
```

Используется в `pages/members/members-filters` для фильтра по специализации.

---

## storage

`api/storage/storage.service.ts` — `providedIn: "root"`. Универсальная обёртка с авто-сериализацией JSON.

```ts
class StorageService {
  setItem(key: string, value: any, storage = localStorage): void;
  getItem<T>(key: string, storage = localStorage): T | null;
}
```

- При `setItem` объекты идут через `JSON.stringify`, примитивы — как есть.
- При `getItem` всё парсится через `JSON.parse` — даже примитивы (`localStorage.getItem("k") = "true"` → `true`).
- `storage`-параметр позволяет переключать между `localStorage` и `sessionStorage`.

**Не покрывает**:

- Удаление ключа (нужно использовать `storage.removeItem(key)` напрямую).
- IndexedDB / cookies.
- Listener'ы на изменения.

Активно используется в:

- `ProfileNewsRepository.readNews` (см. [`docs/modules/profile.md`](modules/profile.md)) — кеширование просмотренных новостей в `sessionStorage["readNews"]`.
- `ProjectNewsRepository.readNews` — то же самое для project-news.
- `ProgramNewsRepository.readNews` — то же для program-news.

---

## swipe

`api/swipe/swipe.service.ts` — `@Injectable()` (page-scoped, не root). Обработка touch-свайпов для модалки фильтра.

```ts
class SwipeService {
  isFilterOpen: signal<boolean>;
  onSwipeStart(event: TouchEvent): void;
  onSwipeMove(event: TouchEvent, filterBody: ElementRef): void;
  onSwipeEnd(event: TouchEvent, filterBody: ElementRef): void;
  closeFilter(): void;
}
```

`swipeThreshold = 50`px — если свайп вниз превышает порог, фильтр закрывается. Анимация через `Renderer2.setStyle(transform: translateY(...))`.

Используется в `pages/projects/list` и `pages/program/detail/list` (мобильная версия фильтра).

---

## toggle-fields

`api/toggle-fields/toggle-fields-info.service.ts` — `@Injectable()` (page-scoped). Один-единственный сигнал и пара методов:

```ts
class ToggleFieldsInfoService {
  readonly showInputFields: signal<boolean>;
  showFields(): void;
  hideFields(): void;
}
```

Использовался для переключения «показать форму добавления achievement» в profile-edit. Очень узко-специфичный сервис — кандидат на удаление и встраивание сигнала прямо в страничный facade.

---

## tooltip

`api/tooltip/tooltip-info.service.ts` — `@Injectable()` (page-scoped). Сигналы видимости 14 tooltip'ов в profile-edit, onboarding, program/project screens и других местах.

```ts
class TooltipInfoService {
  readonly isTooltipVisible: signal<boolean>;
  readonly tooltipPosition: "left" | "right" = "right";
  readonly haveHint: signal<boolean>;

  // Конкретные tooltip'ы по полям
  readonly isHintPhotoVisible, isHintCityVisible, isHintEducationVisible,
    isHintEducationDescriptionVisible, isHintWorkVisible, isHintWorkNameVisible,
    isHintWorkDescriptionVisible, isHintAchievementsVisible, isHintLanguageVisible,
    isHintAuthVisible, isHintLibVisible, isHintLoginVisible, isHintTeamVisible,
    isHintExpertsVisible: signal<boolean>;

  showTooltip(type?: "base" | "photo" | "city" | "education" | "educationDescription" | "work" | "workName" | "workDescription" | "achievements" | "language" | "auth" | "lib" | "login"): void;
  hideTooltip(type?: "base" | "photo" | "city" | "education" | "educationDescription" | "work" | "workName" | "workDescription" | "achievements" | "language" | "auth" | "lib" | "login" | "team" | "experts"): void;
  toggleTooltip(): void; // переключает isHintLoginVisible
}
```

`showTooltip(type)` через `switch` ставит соответствующий signal в `true`; для `"login"` отдельного case нет, поэтому он попадает в default и включает общий `isTooltipVisible`. `toggleTooltip()` отдельно переключает `isHintLoginVisible`.

---

## office

См. [`docs/modules/office-shell.md`](modules/office-shell.md). `OfficeInfoService` + `OfficeUIInfoService` — координаторы shell'а.

---

## onboarding

См. [`docs/modules/office-shell.md`](modules/office-shell.md#onboarding-flow). 4 stage facades + 1 root facade + 5 UI-info сервисов (4 stage UI + root UI).
