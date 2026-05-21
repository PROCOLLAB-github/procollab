<!-- @format -->

# Module: `specializations`

Специализации пользователя — «Frontend разработчик», «UI/UX дизайнер», «Менеджер проекта» и т. п. Используется в profile-edit, onboarding (stage-one), members search.

В отличие от [`skills`](skills.md), специализация — **роль/профессия** (одна или несколько на пользователя), а не _технический навык_. Структурно очень похоже: иерархия "группа → специализация" + плоский поиск.

## Назначение

- **Иерархический список специализаций** для выбора на onboarding и в profile-edit (через `<app-specializations-group>`).
- **Inline-поиск** для autocomplete-фильтра в members search (`api/searches`).

Структурно повторяет `skills`: репозиторий + два use-case'а (`GetSpecializationsNestedUseCase`, `GetSpecializationsInlineUseCase`), фасада нет — потребители инжектят use-case'ы напрямую.

---

## Domain (`domain/specializations/`)

### `specialization.ts`

```ts
interface Specialization {
  id: number;
  name: string;
}
```

Простой контракт — id + название.

### `specializations-group.ts`

```ts
interface SpecializationsGroup {
  id: number;
  name: string; // «Разработка», «Дизайн», ...
  specializations: Specialization[];
}
```

### `ports/specializations.repository.port.ts`

```ts
abstract class SpecializationsRepositoryPort {
  getSpecializationsNested(): Observable<SpecializationsGroup[]>;
  getSpecializationsInline(
    search: string,
    limit: number,
    offset: number
  ): Observable<ApiPagination<Specialization>>;
}
```

DI-биндинг (`infrastructure/di/specializations.providers.ts`):

```ts
{ provide: SpecializationsRepositoryPort, useExisting: SpecializationsRepository }
```

---

## Use-cases (`api/specializations/use-cases/`)

| Use-case                          | Сценарий                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `GetSpecializationsNestedUseCase` | Иерархия групп специализаций для выбора. Возвращает `Result<SpecializationsGroup[], { kind: "server_error" }>`.                                |
| `GetSpecializationsInlineUseCase` | Плоский поиск по специализациям (`search` + `limit` + `offset`). Возвращает `Result<ApiPagination<Specialization>, { kind: "server_error" }>`. |

Подписчик сам управляет состоянием (паттерн `Result<T, E>` через `toAsyncState` в фасадах-потребителях).

---

## Facade

**Отсутствует.** Потребители (формы редактирования профиля / проекта, `SearchesService`) инжектят use-case'ы напрямую. Это соответствует подходу `skills`-модуля.

---

## Repository (`infrastructure/repository/specializations/specializations.repository.ts`)

`SpecializationsRepository implements SpecializationsRepositoryPort`. Pass-through к `SpecializationsHttpAdapter`. Без `EntityCache`, `class-transformer`, без чего-либо ещё.

---

## HTTP endpoints (`infrastructure/adapters/specializations/specializations-http.adapter.ts`)

Префикс `/auth/users/specializations` (особенность бэка — специализации сидят под auth).

| Метод                                             | HTTP | URL                                  | Параметры                                    | Ответ                           |
| ------------------------------------------------- | ---- | ------------------------------------ | -------------------------------------------- | ------------------------------- |
| `getSpecializationsNested()`                      | GET  | `/auth/users/specializations/nested` | —                                            | `SpecializationsGroup[]`        |
| `getSpecializationsInline(search, limit, offset)` | GET  | `/auth/users/specializations/inline` | `?limit=N&offset=N&name__icontains=<search>` | `ApiPagination<Specialization>` |

Оба endpoint без trailing slash (как в [`skills`](skills.md)).

---

## Widget

`<app-specializations-group>` — `widgets/specializations-group/specializations-group.component.ts`. Документирован в [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md#skillsgroupcomponent--specializationsgroupcomponent--skillsbasketcomponent).

Inputs:

- `title: string` (req)
- `options: Specialization[]` (req)
- `hasOpenGroups = false`
- `disabled = false`

Outputs:

- `selectOption: Specialization`
- `groupToggled: boolean`

---

## Consumers

| Где                                                                                    | Как использует                                                                                                 |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pages/profile/edit/edit.component.ts` (через `ProfileFormService.inlineSpecs` signal) | Profile-edit инжектит `GetSpecializationsNestedUseCase` и держит выбранные в форме.                            |
| `pages/onboarding/stage-one/stage-one.resolver.ts`                                     | Резолвер шага 1 онбординга дёргает `GetSpecializationsNestedUseCase.execute()`.                                |
| `api/onboarding/facades/stages/onboarding-stage-one-info.service.ts`                   | Facade onboarding-stage-one — потребляет данные из резолвера.                                                  |
| `api/searches/searches.service.ts`                                                     | Cross-cutting search-сервис использует `GetSpecializationsInlineUseCase` для inline-поиска в members-фильтрах. |

---
