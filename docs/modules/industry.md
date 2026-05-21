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

## Use-cases (`api/industry/use-cases/`)

| Use-case               | Сценарий                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `GetIndustriesUseCase` | Загрузить справочник отраслей и наполнить signal-кеш репозитория. Возвращает `Result<Industry[], { kind: "server_error" }>`. |

Других use-case'ов в `api/industry/` нет — синхронные операции «получить одну по id» и «прочитать сигнал» оформлены тонким фасадом `IndustryInfoService` (см. ниже).

---

## Facade (`api/industry/facades/industry-info.service.ts`)

`IndustryInfoService` — `providedIn: "root"`. Тонкая обёртка над `IndustryRepositoryPort` для UI-слоя:

```ts
@Injectable({ providedIn: "root" })
export class IndustryInfoService {
  readonly industries = this.industryRepository.industries; // re-export сигнала
  getOne(industryId: number): Industry | undefined; // sync lookup
}
```

UI не лазит напрямую в `@infrastructure/...`/`IndustryRepository`; загрузка справочника инициализируется через `GetIndustriesUseCase` из shell (`OfficeInfoService.init()`).

Никакого `AsyncState`: загрузка дёргается один раз из shell, дальше потребители читают синхронно из сигнала `industries`.

---

## Repository (`infrastructure/repository/industry/industry.repository.ts`)

`IndustryRepository implements IndustryRepositoryPort`.

```ts
@Injectable({ providedIn: "root" })
export class IndustryRepository implements IndustryRepositoryPort {
  readonly industries = signal<Industry[]>([]);

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

---

## HTTP endpoints (`infrastructure/adapters/industry/industry-http.adapter.ts`)

| Метод        | HTTP | URL            | Параметры | Ответ                         |
| ------------ | ---- | -------------- | --------- | ----------------------------- |
| `fetchAll()` | GET  | `/industries/` | —         | `Industry[]` (плоский список) |

Один-единственный endpoint. Бэк не поддерживает поиск/пагинацию для отраслей — список целиком и навсегда.

---

## Consumers

| Где                                                            | Как использует                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pages/projects/detail/info/components/projects-left-side`     | Имя отрасли проекта через `IndustryInfoService.getOne(project.industry)`.                     |
| `pages/feed/new-project/new-project.component`                 | Имя отрасли в карточке нового проекта (`IndustryInfoService.getOne(...)`).                    |
| `pages/feed/open-vacancy/open-vacancy.component`               | Имя отрасли в карточке открытой вакансии.                                                     |
| `pages/program/detail/list/rating-card/rating-card.component`  | Имя отрасли в карточке рейтинга.                                                              |
| `widgets/info-card/info-card.component`                        | Отображение `industry.name` в карточке проекта.                                               |
| `widgets/projects-filter/service/projects-filter-info.service` | Опции фильтра проектов по отраслям.                                                           |
| `api/office/facades/office-info.service`                       | На инициализации shell вызывает `industryRepository.getAll()` через порт, чтобы прогреть кеш. |
| `api/project/facades/edit/projects-edit-info.service`          | Селект отрасли в форме редактирования проекта (через `IndustryRepositoryPort`).               |

---
