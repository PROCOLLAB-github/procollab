<!-- @format -->

# Module: `industry`

Справочник отраслей/индустрий — «IT», «Финтех», «Образование», «Урбанистика» и т. д. Используется для классификации проектов, вакансий, программ.

Модуль крошечный — одна модель + один порт + один HTTP-эндпоинт. Особенность: репозиторий ведёт **локальный signal-кеш**, чтобы потребители получали данные синхронно.

## Назначение

- Загрузить список всех отраслей один раз (`getAll()`).
- Кешировать в `signal<Industry[]>` для синхронного доступа из любого компонента.
- Найти отрасль по id (`getOne(id)`) без дополнительного HTTP-запроса.

---

## Domain (`domain/industry/`)

### `industry.model.ts`

```ts
export class Industry {
  id!: number;
  name!: string;
}
```

### `ports/industry.repository.port.ts`

```ts
abstract class IndustryRepositoryPort {
  readonly industries: Signal<Industry[]>; // signal-кеш всех отраслей

  getAll(): Observable<Industry[]>; // загрузка с сервера + наполнение кеша
  getOne(industryId: number): Industry | undefined; // синхронный lookup в кеше
}
```

> **Особенность контракта**: `getOne()` возвращает `Industry | undefined` **синхронно** — не Observable. Если кеш ещё пустой, метод вернёт `undefined`. Поэтому потребитель должен сначала вызвать `getAll()` (или дождаться, что кто-то это сделал).

DI-биндинг (`infrastructure/di/industry.providers.ts`):

```ts
{ provide: IndustryRepositoryPort, useExisting: IndustryRepository }
```

---

## Use-cases

**Нет**. Facade напрямую выставляет порт. Архитектурный долг (как у [`specializations`](specializations.md)).

---

## Facade (`api/industry/facades/industry-info.service.ts`)

`IndustryInfoService` — `providedIn: "root"`. Прозрачно проксирует порт:

```ts
@Injectable({ providedIn: "root" })
export class IndustryInfoService {
  readonly industries = this.industryRepository.industries; // re-export signal
  getAll(): Observable<Industry[]>;
  getOne(industryId: number): Industry | undefined;
}
```

Никакого `AsyncState`. Загрузка обычно дёргается один раз (например, в shell-компоненте `office.component.ts`), а дальше потребители читают через `industries()` сигнал.

---

## Repository (`infrastructure/repository/industry/industry.repository.ts`)

`IndustryRepository implements IndustryRepositoryPort`.

```ts
@Injectable({ providedIn: "root" })
export class IndustryRepository implements IndustryRepositoryPort {
  readonly industries = signal<Industry[]>([]);
  private readonly entityCache = new EntityCache<Industry>(); // (см. ниже)

  getAll(): Observable<Industry[]> {
    return this.industryAdapter.fetchAll().pipe(
      map(industries => plainToInstance(Industry, industries)),
      tap(industries => this.industries.set(industries))
    );
  }

  getOne(industryId: number): Industry | undefined {
    return this.industries().find(industry => industry.id === industryId);
  }
}
```

Внутреннее устройство:

- `industries: signal<Industry[]>` — наполняется при `getAll()`.
- Каждый ответ пропускается через `plainToInstance(Industry, ...)`.
- `getOne()` — синхронный поиск по сигналу.

> **Архитектурный долг**: `private readonly entityCache = new EntityCache<Industry>();` создан, но **нигде не используется**. Атавизм. Удалить или применить (например, кешировать каждую `Industry` отдельно по id).

---

## HTTP endpoints (`infrastructure/adapters/industry/industry-http.adapter.ts`)

| Метод        | HTTP | URL            | Параметры | Ответ                         |
| ------------ | ---- | -------------- | --------- | ----------------------------- |
| `fetchAll()` | GET  | `/industries/` | —         | `Industry[]` (плоский список) |

Один-единственный endpoint. Бэк не поддерживает поиск/пагинацию для отраслей — список целиком и навсегда.

---

## Consumers

| Где                                                            | Как использует                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pages/projects/detail/info/components/projects-left-side`     | Имя отрасли проекта через `industryInfoService.getOne(project.industry)`.                   |
| `pages/feed/new-project/new-project.component`                 | Селект для выбора отрасли при создании проекта.                                             |
| `pages/feed/open-vacancy/open-vacancy.component`               | Аналогично для создания вакансии.                                                           |
| `pages/program/detail/list/rating-card/rating-card.component`  | Имя отрасли в карточке рейтинга.                                                            |
| `widgets/info-card/info-card.component`                        | Отображение `industry.name` в карточке проекта.                                             |
| `widgets/projects-filter/service/projects-filter-info.service` | Опции фильтра проектов по отраслям.                                                         |
| `api/office/facades/office-info.service`                       | Office shell дёргает `IndustryInfoService.getAll()` при инициализации, чтобы заполнить кеш. |
| `api/project/facades/edit/projects-edit-info.service`          | Селект отрасли в форме редактирования проекта.                                              |

---

## Известные проблемы

| Что                                                                              | Где                                             | Заметка                                                                                                                                                                           |
| -------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Нет use-case'ов                                                                  | `api/industry/`                                 | Привести к единому стилю с `skills`.                                                                                                                                              |
| `IndustryInfoService` — pure passthrough                                         | `api/industry/facades/industry-info.service.ts` | Возможно, удалить и инжектить порт напрямую.                                                                                                                                      |
| `EntityCache<Industry>` создан, но не используется                               | `IndustryRepository`                            | Удалить или применить.                                                                                                                                                            |
| `getOne(id)` синхронный — упадёт `undefined` если `getAll()` ещё не дёрнули      | `IndustryRepository.getOne`                     | Текущий контракт допускает `undefined`, потребители должны это обрабатывать. Для большей строгости — переделать на `Observable<Industry \| undefined>` после `take(1)` от signal. |
| Нет инвалидации — отрасли подгружаются один раз и живут до перезагрузки страницы | `IndustryRepository`                            | Нормально, отрасли действительно меняются редко.                                                                                                                                  |
