<!-- @format -->

# Module: `specializations`

Специализации пользователя — «Frontend разработчик», «UI/UX дизайнер», «Менеджер проекта» и т. п. Используется в profile-edit, onboarding (stage-one), members search.

В отличие от [`skills`](skills.md), специализация — **роль/профессия** (одна или несколько на пользователя), а не _технический навык_. Структурно очень похоже: иерархия "группа → специализация" + плоский поиск.

## Назначение

- **Иерархический список специализаций** для выбора на onboarding и в profile-edit (через `<app-specializations-group>`).
- **Inline-поиск** для autocomplete-фильтра в members search (`api/searches`).

В отличие от skills тут **нет** use-case'ов — facade ходит прямо в порт. Это более старый стиль; на use-case'ы пока не переведено.

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

## Use-cases

**Нет**. Facade напрямую дёргает порт. Архитектурный долг — параллельный `skills`-модуль на use-case'ах, тут пока нет.

---

## Facade (`api/specializations/facades/specializations-info.service.ts`)

`SpecializationsInfoService` — `providedIn: "root"`. Тонкий passthrough в порт — `getSpecializationsNested()` / `getSpecializationsInline()`. Без сигналов, без `AsyncState`. Подписчик сам управляет состоянием.

```ts
@Injectable({ providedIn: "root" })
export class SpecializationsInfoService {
  getSpecializationsNested(): Observable<SpecializationsGroup[]>;
  getSpecializationsInline(search, limit, offset): Observable<ApiPagination<Specialization>>;
}
```

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

| Где                                                                       | Как использует                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `pages/profile/edit/...` (через `ProfileFormService.inlineSpecs` signal)  | Profile-edit подгружает специализации через `SpecializationsInfoService.getSpecializationsNested()`, держит выбранные в форме. |
| `pages/onboarding/stage-one` (выбор первой специализации при регистрации) | См. `onboarding-stage-one-info.service.ts`. Резолвер `stage-one.resolver` дёргает `getSpecializationsNested()`.                |
| `api/onboarding/facades/stages/onboarding-stage-one-info.service.ts`      | Facade onboarding-stage-one.                                                                                                   |
| `api/searches/searches.service.ts`                                        | Cross-cutting search-сервис использует inline-поиск специализаций для members-фильтров.                                        |

---
