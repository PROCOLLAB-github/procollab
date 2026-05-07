<!-- @format -->

# `@corelib` — consts

Все константы лежат в `projects/core/src/consts/` (вне `lib/`, отдельная иерархия). Не реэкспортируются из `core/src/public-api.ts` — потребители импортируют их через `@core/consts/...` (alias `@core/*` указывает на `projects/core/src/*`).

## Структура папок

```
core/src/consts/
  filters/        # массивы для фильтров (feed, vacancies, ratings) — value/label/id
  lists/          # справочники для select-полей (educations, languages, etc.)
  navigation/    # элементы боковой/верхней навигации
  other/          # всё, что не попало в другие группы (цвета, иконки, profile-fields, kanban-* — см. ниже)
```

---

## Правила нейминга

(Сохранено из удалённого `projects/core/src/consts/README.md`.)

### Имена файлов

- Формат: `feature.const.ts`
- Стиль: **kebab-case**
- Примеры: `navigation.const.ts`, `selects.const.ts`, `permissions.const.ts`

### Имена переменных

- Стиль: **camelCase**
- Если переменная — список, имя во **множественном числе**
- Имя отражает назначение
- Экспорт только через `export const`

```ts
export const navItems = [...];
```

> На практике это правило соблюдается с отклонениями: исторически встречаются `QuickAnswers`, `KanbanIcons` (PascalCase), `actiionTypeList` (опечатка в имени файла — `actiion-type-list.const.ts` → переменная `actionTypeList`), `workScheludeList` (опечатка `Schelude` вместо `Schedule`). Менять не стоит — это сломает все потребители; помечать как технический долг.

---

## `consts/lists/` — справочники для `<app-select>`

Формат каждой константы: `{ id: number, value: string, label: string }[]` (иногда + дополнительные поля).

| Файл                              | Экспорт                                                                                                                          | Где используется                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `actiion-type-list.const.ts`      | `actionTypeList` (3 элемента: action/call/meet)                                                                                  | Канбан task-detail (выбор типа задачи).       |
| `direction-project-list.const.ts` | `directionProjectList` (8 направлений: Технология, IT, Транспорт, Хим Био, Дизайн, Мультимедиа, СоцТех, Урбанистика)             | Создание/редактирование проекта.              |
| `education-info-list.const.ts`    | `educationUserType` (3) + `educationUserLevel` (5)                                                                               | Profile edit — образование.                   |
| `language-info-list.const.ts`     | `languageNamesList`                                                                                                              | Profile edit — языки.                         |
| `mock-months-list.const.ts`       | `mockMonthsList`                                                                                                                 | Месяцы для дат рождения и т. п.               |
| `priority-info-list.const.ts`     | `priorityInfoList` (6 приоритетов: бэклог/в ближайшие часы/высокий/средний/низкий/улучшение, с цветом и `priorityType` для бэка) | Канбан task-detail (выбор приоритета).        |
| `resource-options-list.const.ts`  | `resourceOptionsList`                                                                                                            | Project edit — типы ресурсов.                 |
| `roles-members-list.const.ts`     | `rolesMembersList`                                                                                                               | Members filters / project team.               |
| `track-project-list.const.ts`     | `trackProjectList`                                                                                                               | Программные треки.                            |
| `work-experience-list.const.ts`   | `workExperienceList`                                                                                                             | Vacancy / profile (опыт работы).              |
| `work-format-list.const.ts`       | `workFormatList`                                                                                                                 | Vacancy (формат работы — онлайн/гибрид/офис). |
| `work-schelude-list.const.ts`     | `workScheludeList` (опечатка)                                                                                                    | Vacancy (график).                             |

---

## `consts/filters/` — конфигурации фильтров

| Файл                              | Экспорт                |
| --------------------------------- | ---------------------- |
| `feed-filter.const.ts`            | `feedFilter`           |
| `rating-filter.const.ts`          | `ratingFilters`        |
| `tags-filter.const.ts`            | `tagsFilter`           |
| `work-experience-filter.const.ts` | `workExperienceFilter` |
| `work-format-filter.const.ts`     | `workFormatFilter`     |
| `work-schedule-filter.const.ts`   | `workScheduleFilter`   |

Используются виджетами `widgets/feed-filter`, `widgets/projects-filter`, `widgets/vacancy-filter`. Структура — массив групп с фильтрами.

---

## `consts/navigation/` — элементы пошагового редактирования

| Файл                         | Экспорт           | Что                                                                                                                                                                 |
| ---------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nav-profile-items.const.ts` | `navProfileItems` | Шаги редактирования профиля (`main` / `education` / `experience` / `achievements` / `additional`), каждый шаг → `{ step: EditStep, src: iconName, label: string }`. |
| `nav-project-items.const.ts` | `navProjectItems` | Шаги редактирования проекта (`main` / `contacts` / `achievements` / `vacancies` / `team` / `additional`).                                                           |

Тип `EditStep` импортируется из `projects/social_platform/src/app/api/project/project-step.service` — это ещё одна зависимость `core` → `social_platform`.

---

## `consts/other/`

| Файл                          | Экспорт                     | Что                                                                                                           | Статус                                             |
| ----------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `profile-fields.const.ts`     | `profileFields`             | Конфигурация полей профиля: `{ key, type: "array" \| "string" }[]`. Используется при сериализации формы edit. | актив                                              |
| `quick-answers.const.ts`      | `QuickAnswers` (PascalCase) | 5 готовых причин отказа от выполнения канбан-задачи.                                                          | **используется только канбаном** — модуль отключён |
| `tag-colors.const.ts`         | `tagColors`                 | 10+ цветов для UI-тегов: `{ id, name: string, color: hex }`.                                                  | актив (используется в `<app-tag>`)                 |
| `trajectory-more.const.ts`    | `trajectoryMore`            | Items для меню "ещё" в траектории курсов.                                                                     | актив                                              |
| `kanban-column-info.const.ts` | `kanbanColumnInfo`          | Опции dropdown для колонки канбана.                                                                           | **kanban-only**, модуль отключён                   |
| `kanban-icons.const.ts`       | `KanbanIcons` (PascalCase)  | Иконки досок канбана.                                                                                         | **kanban-only**, модуль отключён                   |

> Канбан-константы (`quick-answers`, `kanban-column-info`, `kanban-icons`) физически остаются в репо вместе с остальной канбан-инфраструктурой — см. [`docs/PROJECT.md` → kanban-disabled](../PROJECT.md#точки-входа-в-роутинг). Импортировать их вне канбан-кода — нет смысла, можно снести вместе с канбаном или дождаться возобновления модуля.

---

## Как добавлять новую константу

1. Создать `<feature>.const.ts` в подходящей папке (`lists/` для справочников `<select>`, `filters/` для фильтров, `navigation/` для шагов нав-меню, `other/` для остального).
2. Имя файла — **kebab-case**, имя константы — **camelCase**.
3. Если константа — массив, имя во множественном числе.
4. Экспорт через `export const`. Никаких `export default`.
5. Если константа описывает выбор для `<app-select>` — структура `{ id, value, label }` плюс при необходимости `additionalInfo` для иконки/цвета.
6. Импортировать через alias: `import { foo } from "@core/consts/other/foo.const"`.

---

## Архитектурный долг

| Что                                                                                  | Как фиксить                                                                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Канбан-константы (`quick-answers`, `kanban-*`) дрейфуют вместе с отключённым модулем | Решить судьбу канбана; если оставляем — пометить через `docs/PROJECT.md`, если удаляем — снести вместе. |
| Опечатки в именах файлов и переменных (`actiion-type-list`, `workScheludeList`)      | Точечный rename + поиск всех мест использования. Сейчас не критично.                                    |
| Mismatch с правилом нейминга (`QuickAnswers`, `KanbanIcons` в PascalCase)            | То же.                                                                                                  |
| `nav-profile-items.const.ts` импортирует `EditStep` из `social_platform`             | Поднять `EditStep` в `core/lib/models/` или превратить в string-литерал union.                          |
| `consts/` не имеют публичного `index.ts` — каждый импорт идёт глубоким путём         | Не критично (consts read-only), но единый `index.ts` уменьшит длину импортов.                           |
