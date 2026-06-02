<!-- @format -->

# Module: `member`

Список и поиск участников платформы. Член (`member`) — это `User` с `userType === 1`

## Назначение

- **Список участников** (`/office/members`) с пагинацией (skip/take) и инфинит-скроллом.
- **Поиск по имени** через `searchForm`.
- **Фильтрация** по ключевому навыку, специальности, возрастному диапазону, флагу студента МосПолитеха (`isMosPolytechStudent`).

Модель пользователя — `User` из [`docs/modules/auth.md`](auth.md). Свой domain-модели у member нет, только port.

---

## Domain (`domain/member/`)

### `ports/member.repository.port.ts`

```ts
abstract class MemberRepositoryPort {
  getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>,
  ): Observable<ApiPagination<User>>;
}
```

DI-биндинг (`infrastructure/di/member.providers.ts`):

```ts
{ provide: MemberRepositoryPort, useExisting: MemberRepository }
```

---

## Use-cases (`api/member/use-cases/`)

| Use-case            | Параметры                                          | Возвращает                                                           | Ошибки              |
| ------------------- | -------------------------------------------------- | -------------------------------------------------------------------- | ------------------- |
| `GetMembersUseCase` | `skip, take: number, params?: Record<string, ...>` | `Result<ApiPagination<User>, { kind: "get_members_error"; cause? }>` | `get_members_error` |

---

## Facades (`api/member/facades/`)

### `MembersInfoService`

`@Injectable()` (page-scoped). Управляет жизненным циклом `/office/members`:

- `initializationMembers()` — устанавливает заголовок «Участники» через `NavService`, подписывается на изменения форм поиска / фильтра / query params, дёргает `GetMembersUseCase`.
- Реактивно дёргает `getMembers(skip, take, params)` при изменении `searchForm` / `filterForm` (через `debounceTime`/`distinctUntilChanged`).
- Синхронизирует фильтры в URL (`router.navigate(..., { queryParams })`).
- При смене query params (skip 1 — пропускает initial value, который уже загружен resolver'ом) переопределяет список.
- Бесконечный скролл — отслеживает scroll контейнера через `fromEvent`/`throttleTime`, дёргает следующую страницу когда near bottom.

### `MembersUIInfoService`

`@Injectable()` (page-scoped). UI-info — состояние списка и формы:

| Поле / signal       | Тип                           | Что                                                                                     |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| `members$`          | `signal<AsyncState<User[]>>`  | Состояние списка (initial/loading/success/failure).                                     |
| `members`           | `computed<User[]>`            | Текущий массив для UI. При `loading` показывает `previous` (оптимистичный refresh).     |
| `membersTotalCount` | `signal<number \| undefined>` | Общее количество (для индикатора).                                                      |
| `membersTake`       | `signal<number>`              | Размер страницы (default `20`).                                                         |
| `membersPage`       | `signal<number>`              | Текущая страница пагинации.                                                             |
| `searchForm`        | `FormGroup`                   | `{ search }` (required).                                                                |
| `filterForm`        | `FormGroup`                   | `{ keySkill (req), speciality (req), age: [null, null], isMosPolytechStudent: false }`. |

Метод `applyMembersPagination(data)` — сеттер из resolver'а: пишет `count` + `success(results)`.

### Mentors

Отдельного UI-фасада для менторов нет — менторы вытаскиваются тем же `MemberRepository.getMentors()` и пагинируются через общий `MembersUIInfoService`. Эндпоинт у бэка один, тип пользователя различается параметром `user_type` (см. ниже).

---

## Repository (`infrastructure/repository/member/member.repository.ts`)

`MemberRepository implements MemberRepositoryPort`. Pass-through к адаптеру с `plainToInstance(User, ...)` на каждом результате.

---

## HTTP endpoints (`infrastructure/adapters/member/member-http.adapter.ts`)

Префикс `/auth/public-users`. Эндпоинт один — фильтр `user_type` различает members от mentors.

| Метод                                  | HTTP | URL                   | Параметры                                                | Ответ                 |
| -------------------------------------- | ---- | --------------------- | -------------------------------------------------------- | --------------------- |
| `getMembers(skip, take, otherParams?)` | GET  | `/auth/public-users/` | `?user_type=1&limit=<take>&offset=<skip>&...otherParams` | `ApiPagination<User>` |

`otherParams` (фильтры) — произвольный объект, ожидаемые ключи:

- `key_skill` — id ключевого навыка.
- `speciality` — id специализации.
- `age_from` / `age_to` — диапазон возраста.
- `is_mos_polytech_student` — `true`/`false`.

---

## Routes

Подключено в **office shell routes** (`ui/routes/office/office.routes.ts`) — отдельных member.routes.ts нет:

```ts
{
  path: "members",
  component: MembersComponent,
  // resolve: MembersResolver  (загружает первые 20)
}
```

---

## Pages (`ui/pages/members/`)

| Page                      | Файл                                                         | Selector              | Что                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MembersComponent`        | `pages/members/members.component.ts`                         | `app-members`         | Главная страница списка. Подключает `<app-search>`, `<app-members-filters>`, `<app-info-card type="members">`, `<app-back>` (через `@uilib`), `<app-button>`. Provides `MembersInfoService` + `MembersUIInfoService`.                                                |
| `MembersFiltersComponent` | `pages/members/members-filters/members-filters.component.ts` | `app-members-filters` | Форма фильтров. Принимает `filterForm: MembersComponent["filterForm"]` через `@Input`, эмитит `filtersChanged: void`. Использует `<app-autocomplete-input>` для key skill (через `SkillsInfoService`) и для specialty (через `SearchesService` — см. cross-cutting). |

`members.resolver.ts` — `MembersResolver` для фета первых `0..20` через `GetMembersUseCase`. На `Result.fail` возвращает пустую `ApiPagination`.

---

## Consumers (за пределами модуля)

| Где                                                | Как использует                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `widgets/info-card` (с `type="members"`)           | Карточка участника в списке.                                                    |
| `pages/projects/edit/components/project-team-step` | Использует `MemberRepositoryPort.getMembers()` для поиска кандидатов в команду. |
| `pages/onboarding/...`                             | Может дёргать `getMembers` для рекомендаций.                                    |

---
