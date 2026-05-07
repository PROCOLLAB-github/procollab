<!-- @format -->

# Module: `skills`

Технические навыки пользователей и проектов: «Программирование», «Дизайн», «UI/UX», и т. д. Используется в profile-edit, project-edit (вакансии), members-filters, onboarding.

> **Не путать с подсистемой подписок.** Этот модуль работает с навыками через **основной API** (`/core/skills/...` под `API_URL`). Отдельный `SKILLS_API_URL` (`SkillsApiService`, `SubscriptionPlansService`) — это **другая** подсистема для оплаты подписок (`skills.dev.procollab.ru` / `api.skills.procollab.ru`), не имеющая отношения к этому модулю.

## Назначение

- **Иерархический список навыков**: дерево "категория → конкретный навык". Используется в формах выбора скиллов через `<app-skills-group>`.
- **Inline-поиск навыков**: плоский поиск с пагинацией для autocomplete-полей.
- Управление выбранными навыками внутри `FormGroup` через утилиты `add` / `remove` / `toggle`.

`onAddSkill` / `onRemoveSkill` живут в фасаде, потому что виджеты `<app-skills-group>` / `<app-skills-basket>` — dumb (только эмитят `optionToggled`), а добавление/удаление в общую `FormGroup` делает фасад.

---

## Domain (`domain/skills/`)

### `skill.ts`

```ts
interface Skill {
  id: number;
  name: string;
  category: { id: number; name: string };
  approves: Approve[];
}

interface Approve {
  confirmedBy: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
    speciality: string;
    v2Speciality: { id: number; name: string };
  };
}
```

`approves[]` — список пользователей, подтвердивших навык. Подтверждение (approve / unapprove) идёт через legacy `ProfileService` (см. [`docs/modules/auth.md`](auth.md#legacy)) — endpoint `/auth/users/<userId>/approve_skill/<skillId>/`.

### `skills-group.ts`

```ts
interface SkillsGroup {
  id: number;
  name: string;     // "Программирование", "Дизайн", ...
  skills: Skill[];
}
```

Группа навыков для иерархического выбора.

### `ports/skills.repository.port.ts`

```ts
abstract class SkillsRepositoryPort {
  getSkillsNested(): Observable<SkillsGroup[]>;
  getSkillsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Skill>>;
}
```

DI-биндинг (`infrastructure/di/skills.providers.ts`):

```ts
{ provide: SkillsRepositoryPort, useExisting: SkillsRepository }
```

---

## Use-cases (`api/skills/use-cases/`)

| Use-case | Параметры | Возвращает | Ошибки |
|---|---|---|---|
| `GetSkillsNestedUseCase` | — | `Result<SkillsGroup[], { kind: "server_error" }>` | `server_error` |
| `SearchSkillsUseCase` | `search: string, limit, offset: number` | `Result<ApiPagination<Skill>, { kind: "server_error" }>` | `server_error` |

Оба возвращают `server_error` на любую ошибку. Тонкая гранулярность не нужна — для skill-поиска UX простой (показываем «попробуйте ещё раз»).

---

## Facade (`api/skills/facades/skills-info.service.ts`)

`SkillsInfoService` — `providedIn: "root"`. Не использует `AsyncState` — простой helper-сервис над репозиторием:

```ts
@Injectable({ providedIn: "root" })
export class SkillsInfoService {
  // Сигнал результата inline-поиска (autocomplete)
  readonly inlineSkills = signal<Skill[]>([]);

  // Прямой делегат — иерархический список навыков
  getSkillsNested(): Observable<SkillsGroup[]>;

  // Inline-поиск (1000 элементов фиксированно, без пагинации)
  onSearchSkill(query: string): void;

  // Утилиты для FormGroup с полем skills: Skill[]
  onToggleSkill(toggledSkill: Skill, form: FormGroup): void;
  onAddSkill(newSkill: Skill, form: FormGroup): void;
  onRemoveSkill(oddSkill: Skill, form: FormGroup): void;
}
```

> **Замечание про contract**: `onSearchSkill(query)` фиксированно дёргает `getSkillsInline(query, 1000, 0)` — пагинацию не пробрасывает. Если на бэке навыков больше 1000, остальные не подгрузятся. Это нормально для текущего объёма данных, но не масштабируется.

> **Архитектурный долг**: `SkillsInfoService` напрямую дёргает `SkillsRepositoryPort` минуя use-case'ы. На use-case'ы переведена не вся работа — `getSkillsNested()` и `onSearchSkill()` обходят их. На use-case'ы можно перейти точечно.

---

## Repository (`infrastructure/repository/skills/skills.repository.ts`)

`SkillsRepository implements SkillsRepositoryPort`. Тонкий passthrough в адаптер — кеширование и трансформации не делает.

```ts
getSkillsNested(): Observable<SkillsGroup[]>           // → adapter
getSkillsInline(search, limit, offset)                 // → adapter
```

Без `EntityCache<T>` (см. [`docs/social-platform/architecture.md`](../social-platform/architecture.md#cross-cutting-блоки)) — справочник навыков обычно не меняется в рамках сессии, но повторные запросы не дедуплицируются. Для масштабных страниц с многими `<app-skills-group>` это **может** дать N запросов на одни и те же данные. Возможный fix — добавить `shareReplay`-кеш на `getSkillsNested`.

---

## HTTP endpoints (`infrastructure/adapters/skills/skills-http.adapter.ts`)

Префикс `/core/skills`.

| Метод | HTTP | URL | Параметры | Ответ |
|---|---|---|---|---|
| `getSkillsNested()` | GET | `/core/skills/nested` | — | `SkillsGroup[]` |
| `getSkillsInline(search, limit, offset)` | GET | `/core/skills/inline` | `?limit=N&offset=N&name__icontains=<search>` | `ApiPagination<Skill>` |

> Оба endpoint без trailing slash (`/nested`, `/inline`). В Django это работает с APPEND_SLASH=True; на других серверах — потенциальный 301. Но это особенность бэка, не делать sane defaults.

---

## Widgets, потребляющие skills

| Widget | Где документирован | Как использует |
|---|---|---|
| `<app-skills-group>` | [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md#skillsgroupcomponent--specializationsgroupcomponent--skillsbasketcomponent) | Принимает `options: Skill[]` (из `SkillsGroup.skills`) и `selected: Skill[]`, эмитит `optionToggled: Skill`. |
| `<app-skills-basket>` | то же | Корзина выбранных навыков; читает `Skill[]` из родительской ReactiveForm. |

---

## Consumers

| Где | Как использует |
|---|---|
| `pages/profile/edit/components/profile-skills-step` | Главная страница выбора скиллов в profile-edit. Дёргает `SkillsInfoService.getSkillsNested()` для отрисовки `<app-skills-group>` групп; держит `Skill[]` в `FormGroup`. |
| `pages/projects/edit/components/project-vacancy-step` | Скиллы для каждой вакансии проекта (`requiredSkills`). |
| `pages/projects/detail/kanban/components/task/detail/task-detail.component.ts` | Канбан-задача (отключён сейчас) — `requiredSkills` для задачи, выбираются из `<app-skills-group>`. |
| `pages/members/members-filters` | Фильтр участников по навыкам — inline-поиск через `<app-autocomplete-input>`. |
| `pages/onboarding/stage-two` | Шаг онбординга «выбери свои навыки». |
| `api/profile/facades/edit/profile-edit-skills-info.service.ts` | Profile-edit step facade использует `SkillsInfoService`. |
| `api/project/facades/edit/projects-edit-info.service.ts` | Project-edit аналогично. |
| `api/onboarding/facades/stages/onboarding-stage-two-info.service.ts` | Onboarding stage-two. |

---

## Известные проблемы

| Что | Где | Заметка |
|---|---|---|
| `getSkillsNested()` — нет кеширования, повторные подписки бьют API | `SkillsRepository.getSkillsNested` | Добавить `shareReplay(1)` или интегрировать в `EntityCache`-like структуру (но cache по id не подходит — список один). |
| `onSearchSkill(query)` фиксирует limit=1000 | `SkillsInfoService.onSearchSkill` | Принимать `limit` параметром или сделать ленивую подгрузку. |
| `SkillsInfoService` ходит в порт минуя use-case'ы | `SkillsInfoService` | Переключить на `GetSkillsNestedUseCase` / `SearchSkillsUseCase` для единообразия. |
| URL без trailing slash | `skills-http.adapter.ts` | На Django безопасно. |
| Approve / unapprove ходят через legacy `ProfileService` (`api/auth/profile.service.ts`), не через этот модуль | `auth.profile.service` | Перенести в `api/skills/use-cases/approve-skill.use-case.ts` и подобные. |
| Двусмысленность имени "skills" — этот модуль и `SkillsApiService` (для подписок) | везде | Не баг, но при чтении кода путает. Возможно стоит переименовать `SkillsApiService` в `SubscriptionsApiService`. |
