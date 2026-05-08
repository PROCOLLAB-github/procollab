<!-- @format -->

# `social_platform` — ui/primitives

Атомы внутри `social_platform`. Используются повсеместно — в виджетах и страницах. Папка `projects/social_platform/src/app/ui/primitives/` содержит 22 директории; есть общий `index.ts` для нескольких ходовых компонентов:

```ts
// импорт ходовых через короткий путь
import { ButtonComponent, IconComponent, InputComponent, SelectComponent } from "@ui/primitives";

// остальные — глубоким путём
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TagComponent } from "@ui/primitives/tag/tag.component";
```

> Большинство компонентов реализуют `ControlValueAccessor` — встраиваются в Reactive Forms через `formControlName` / `[formControl]`. Это указано в колонке "CVA".

## Сводка

| Компонент                       | Selector                 | CVA | Inputs                                                                                                                                                                                                                                                                                                                                   | Outputs                                                                                  |
| ------------------------------- | ------------------------ | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `AutoCompleteInputComponent<T>` | `app-autocomplete-input` | —   | `suggestions: T[]` (req), `fieldToDisplayMode: "text" \| "chip" = "text"`, `fieldToDisplay: keyof T`, `valueField: string`, `forceSelect = false`, `clearInputOnSelect = false`, `delay = 300`, `placeholder = ""`, `searchIcon = "search"`, `slimVersion = false`, `error = false`                                                      | `openSkillsFunc: void`, `searchStart: string`, `optionSelected: T`, `inputCleared: void` |
| `AvatarComponent`               | `app-avatar`             | —   | `url?: string` (req), `size = 50`, `hasBorder = false`, `borderColor = "white"`, `isOnline = false`, `progress?: number`, `onlineBadgeSize = 16`, `onlineBadgeBorder = 3`, `onlineBadgeOffset = 0`                                                                                                                                       | —                                                                                        |
| `AvatarControlComponent`        | `app-avatar-control`     | ✓   | `size = 140`, `error = false`, `type: "avatar" \| "project" \| "profile" = "avatar"`, `haveHint = false`, `tooltipText?`, `tooltipPosition = "right"`, `tooltipWidth = 250`                                                                                                                                                              | —                                                                                        |
| `BarComponent`                  | `app-bar`                | —   | `links: { ... }[]` (req), `ballHave?: boolean`, `backRoute?: string`, `backHave?: boolean`                                                                                                                                                                                                                                               | —                                                                                        |
| `ButtonComponent`               | `app-button`             | —   | `color = "primary"` (одно из 7), `loader = false`, `size = "small"` (4 значения), `hasBorder = true`, `type = "button"` (4 типа), `appearance = "inline"` (`inline \| outline`), `backgroundColor?`, `disabled = false`, `customTypographyClass?`                                                                                        | —                                                                                        |
| `CheckboxComponent`             | `app-checkbox`           | —   | `checked = false` (req), `size?`                                                                                                                                                                                                                                                                                                         | `checkedChange: boolean`                                                                 |
| `DropdownComponent`             | `app-dropdown`           | —   | `options: { id, label, value, additionalInfo? }[]`, `type = "text"` (`icons \| avatars \| shapes \| tags \| goals \| text`), `isOpen = false`, `creatingTag = false`, `highlightedIndex = -1`, `colorText = "grey"` (`grey \| red`), `editingTag: TagDto \| null`                                                                        | `select: number`, `outside: void`, `updateTag: TagDto`, `tagInfo: { name, color }`       |
| `FileItemComponent`             | `app-file-item`          | —   | `canDelete = false`, `mode = "default"` (`default \| preview`), `type = "file"`, `name = ""`, `size = 0`, `link = ""`                                                                                                                                                                                                                    | `deleted: void`                                                                          |
| `FileUploadItemComponent`       | `app-file-upload-item`   | —   | `type = "file"`, `name = ""`, `size = 0`, `link = ""`, `loading = false`, `error = ""`                                                                                                                                                                                                                                                   | `delete: void`, `retry: void`                                                            |
| `IconComponent`                 | `[appIcon]` (атрибут)    | —   | `appSquare?`, `appViewBox?`, `appWidth?`, `appHeight?`, `icon: string` (req)                                                                                                                                                                                                                                                             | —                                                                                        |
| `ImgCardComponent`              | `app-img-card`           | —   | `src = ""`, `error = false`, `loading = false`                                                                                                                                                                                                                                                                                           | `cancel: void`, `retry: void`                                                            |
| `InputComponent`                | `app-input`              | ✓   | `placeholder = ""`, `type = "text"` (6 типов: text/password/email/tel/date/radio), `size = "small"` (`small \| big`), `hasBorder = true`, `haveHint = false`, `tooltipText?`, `tooltipPosition = "right"`, `tooltipWidth = 250`, `error = false`, `mask = ""` (ngx-mask), `name = ""`, `checked = false`, `maxLength?`, `value` (setter) | `appValueChange: string`, `enter: void`, `change: Event`                                 |
| `LoaderComponent`               | `app-loader`             | —   | `speed = "1s"`, `size = "15px"`, `color = "white"`, `type = "circle"` (`wave \| circle`)                                                                                                                                                                                                                                                 | —                                                                                        |
| `ModalComponent`                | `app-modal`              | —   | `color?: "primary" \| "gradient"`, `bodyClass?`, `open: boolean` (req, setter — управляет рендером + body-scroll-lock)                                                                                                                                                                                                                   | `openChange: boolean`                                                                    |
| `SearchComponent`               | `app-search`             | ✓   | `placeholder`, `type = "text"`, `error = false`, `mask = ""`, `openable = true`, `value` (setter)                                                                                                                                                                                                                                        | `appValueChange: string`, `enter: void`                                                  |
| `SelectComponent`               | `app-select`             | ✓   | `placeholder`, `selectedId?`, `size = "small"`, `options: { id, value, label }[]` (req), `error = false`, `isDisabled` (setter)                                                                                                                                                                                                          | —                                                                                        |
| `SoonCardComponent`             | `app-soon-card`          | —   | `title: string` (req), `description: string` (req)                                                                                                                                                                                                                                                                                       | —                                                                                        |
| `SwitchComponent`               | `app-switch`             | —   | `checked: boolean` (req)                                                                                                                                                                                                                                                                                                                 | `checkedChange: boolean`                                                                 |
| `TagComponent`                  | `app-tag`                | —   | `color: <палитра>` (10+ значений), `type?: "days" \| "overdue" \| "answer"`, `appearance = "inline"`, `canEdit?`, `canDelete?`, `isKanbanTag = false`                                                                                                                                                                                    | `delete: void`, `edit: void`                                                             |
| `TextareaComponent`             | `app-textarea`           | ✓   | `placeholder`, `type = "text"`, `haveHint = false`, `tooltipText?`, `tooltipPosition`, `tooltipWidth`, `maxLength?`, `error = false`, `size = "small"`, `mask = ""`, `text` (setter)                                                                                                                                                     | `textChange: string`                                                                     |
| `TooltipComponent`              | `app-tooltip`            | —   | `text = ""`, `isVisible = false`, `position = "right"`, `iconSize = "16"`, `tooltipWidth = 250`, `customClass = ""`, `color = "accent"` (`accent \| grey`)                                                                                                                                                                               | `show: void`, `hide: void`                                                               |
| `UploadFileComponent`           | `app-upload-file`        | ✓   | `accept = ""`, `error = false`, `resetAfterUpload = false`                                                                                                                                                                                                                                                                               | `uploaded: { url, name, size }`, остальное обрабатывается через CVA                      |

---

## Заметки по отдельным примитивам

### `IconComponent` (`[appIcon]`)

Атрибутная директива (не компонент). Применяется на любой HTML-тег и рендерит `<svg><use href="#icon-<name>"/></svg>`. Иконки берёт из спрайта `assets/icons/symbol/svg/sprite.css.svg`, который собирает `npm run build:sprite` из всех `assets/icons/svg/**/*.svg`.

Пример:

```html
<i appIcon icon="task" appSquare="24"></i>
<i appIcon icon="phone" appWidth="20" appHeight="22" appViewBox="0 0 20 22"></i>
```

`appSquare` автоматически выставляет `viewBox="0 0 N N"` если он не задан.

### `ModalComponent` (`app-modal`)

`open` — required setter, управляет:

- рендером `<div class="modal">` через `*ngIf`;
- `document.body.style.overflow = "hidden"` для блокировки скролла страницы.

`openChange` — для `[(open)]` two-way binding.

### `DropdownComponent` (`app-dropdown`)

Используется как универсальный popover для `app-select`, для тегов в канбан-задачах, для кастомных меню. `type` определяет, как рендерить элементы (`icons`, `avatars`, `shapes`, `tags`, `goals`, `text`).

> **Известный архитектурный долг**: `DropdownComponent` импортирует `TagDto` из `@api/kanban/dto/tag.model.dto` и `CreateTagFormComponent` из `@ui/pages/projects/detail/kanban/components/create-tag-form/create-tag-form.component`. Примитив (атом) зависит от feature-кода (страница). После рефакторинга `be9344be` это регрессия — каждый потребитель `<app-dropdown>` тащит kanban-форму создания тега в бандл. Канбан-роуты сейчас отключены, но импорты остаются.

### `TagComponent` (`app-tag`)

Палитра `color` — около 10 значений, привязана к CSS-переменным (`--accent`, `--blue-dark` и т. п.). `type: "days" \| "overdue" \| "answer"` — переключатель преднастроенных стилей для тегов времени/статуса.

### `AutoCompleteInputComponent<T>`

Generic-компонент. `T` — тип элемента в `suggestions`. Через `fieldToDisplay: keyof T` указывается, какое поле показывать в списке. `delay = 300` — debounce между вводом и `searchStart`.

### `SelectComponent`

Использует `DropdownComponent` под капотом для рендера опций. `selectedId` — id одной выбранной опции (single-select).

### Компоненты с `ControlValueAccessor` (CVA)

Подходят для `formControl`/`formControlName`:
`AvatarControlComponent`, `InputComponent`, `SearchComponent`, `SelectComponent`, `TextareaComponent`, `UploadFileComponent`.

Остальные (`Checkbox`, `Switch`) принимают `checked` через `[checked]` + `(checkedChange)` — двухсторонний биндинг через `[(checked)]`, не CVA.

---

## Архитектурный долг

| Что                                                                             | Где                                            | Заметка                                                                                                                   |
| ------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DropdownComponent` импортирует kanban-код                                      | `ui/primitives/dropdown/dropdown.component.ts` | Вытащить `TagDto` в `@domain/...`, `CreateTagFormComponent` оставить в page-области, не использовать его внутри dropdown. |
| `InputComponent` `value` setter без чёткого типа `string \| number`             | `ui/primitives/input/input.component.ts`       | Привязка к `mask` усложняет, но типизировать стоит.                                                                       |
| Не все примитивы реэкспортированы из `ui/primitives/index.ts`                   | `index.ts`                                     | Добавить остальные для коротких импортов через `@ui/primitives`.                                                          |
| `AvatarComponent.url` помечен `required: true`, но тип `string \| undefined`    | `ui/primitives/avatar/avatar.component.ts`     | Решить — либо `url: string`, либо снять `required`. То же замечание в `@uilib`.                                           |
| `BarComponent.links` без явной типизации (`{ ... }[]`)                          | `ui/primitives/bar/bar.component.ts`           | Описать interface.                                                                                                        |
| `ImgCardComponent` дублирует функциональность `AvatarComponent` для не-аватарок | оба                                            | Решить, нужен ли отдельный компонент для картинок-карточек.                                                               |
