<!-- @format -->

# `@uilib` — shared UI library

`projects/ui/` — отдельная Angular library (`ng-packagr`). Содержит layout-компоненты и небольшой набор примитивов, которые могут переиспользоваться между приложениями. Публичный API — `projects/ui/src/public-api.ts`, импортируется как `@uilib`. Модели — `uilib/models`.

> Большинство UI-примитивов и виджетов (input, dropdown, modal, tag, news-card, detail и т. д.) живёт **внутри** `social_platform` (`app/ui/primitives/*`, `app/ui/widgets/*`), а не в `@uilib`. В библиотеку вынесено только то, что задумывалось как переиспользуемое между приложениями.

## Структура

```
projects/ui/src/
  lib/
    components/
      layout/         # большие layout-блоки (sidebar, профильные панели, карточки приглашений)
        empty-manage-card/
        invite-manage-card/
        profile-control-panel/
        profile-info/
        sidebar/
        index.ts      # реэкспорт (не включает empty-manage-card)
      primitives/     # атомы (avatar, back, icon)
        avatar/
        back/
        icon/
        index.ts      # реэкспорт
      index.ts        # реэкспортирует layout + primitives
    models/
      user.model.ts   # interface User (не реэкспортирован, импорт через `uilib/models/user.model`)
  public-api.ts       # реэкспортирует только ./lib/components
```

---

## Сводка компонентов

| Компонент                      | Selector                        | Тип                        | Inputs                                                                                                                                                   | Outputs                                                        |
| ------------------------------ | ------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SidebarComponent`             | `ui-sidebar`                    | layout                     | `navItems: NavItem[]`, `logoSrc: string` (required)                                                                                                      | —                                                              |
| `ProfileControlPanelComponent` | `app-profile-control-panel`     | layout                     | `user: User \| null`, `invites: Invite[]`, `hasNotifications: boolean`, `hasUnreads: boolean` (все required)                                             | `acceptInvite: number`, `rejectInvite: number`, `logout: void` |
| `ProfileInfoComponent`         | `app-profile-info`              | layout                     | `user: User` (required)                                                                                                                                  | `logout: void`                                                 |
| `InviteManageCardComponent`    | `app-invite-manage-card`        | layout                     | `invite: Invite` (required)                                                                                                                              | `accept: number`, `reject: number`                             |
| `EmptyManageCardComponent`     | `app-empty-manage-card`         | layout (**не в `@uilib`**) | —                                                                                                                                                        | —                                                              |
| `AvatarComponent`              | `app-avatar`                    | primitive                  | `url: string` (required), `size = 50`, `hasBorder = false`, `isOnline = false`, `onlineBadgeSize = 16`, `onlineBadgeBorder = 3`, `onlineBadgeOffset = 0` | —                                                              |
| `BackComponent`                | `app-back`                      | primitive                  | `path?: string`, `namespace?: string`                                                                                                                    | —                                                              |
| `IconComponent`                | `[appIcon]` (директива-атрибут) | primitive                  | `appSquare?`, `appViewBox?`, `appWidth?`, `appHeight?`, `icon: string` (required)                                                                        |

## Layout components

### SidebarComponent (`ui-sidebar`)

Боковая навигация с логотипом и анимированным «highlight bar» (полоса подсветки активного пункта). Поддерживает внешние и внутренние ссылки.

**Inputs**

```ts
@Input() navItems: NavItem[] = [];
@Input({ required: true }) logoSrc!: string;
```

**Тип `NavItem`** (экспортируется из `sidebar.component.ts`):

```ts
export interface NavItem {
  link: string; // путь для router
  icon: string; // имя иконки из SVG-спрайта
  name: string; // отображаемый текст
  isExternal?: boolean; // флаг для внешних ссылок (target="_blank" и т. п.)
  isActive?: boolean; // ручной флаг активности (для внешних ссылок)
}
```

**Использование**

```html
<ui-sidebar [navItems]="navigationItems" [logoSrc]="logoUrl"></ui-sidebar>
```

---

### ProfileControlPanelComponent (`app-profile-control-panel`)

Панель в шапке/сайдбаре: иконки уведомлений и чатов, dropdown профиля с приглашениями и кнопкой logout.

**Inputs**

```ts
@Input({ required: true }) user!: User | null;
@Input({ required: true }) invites!: Invite[];
@Input({ required: true }) hasNotifications = false;  // unread notifications dot
@Input({ required: true }) hasUnreads = false;        // unread chats dot
```

**Outputs**

```ts
@Output() acceptInvite = new EventEmitter<number>();  // → invite.id
@Output() rejectInvite = new EventEmitter<number>();
@Output() logout = new EventEmitter<void>();
```

`Invite` — модель приглашения, импортируется из `social_platform/domain/invite/...`.

---

### ProfileInfoComponent (`app-profile-info`)

Мини-блок с аватаром, именем и быстрой кнопкой logout. Используется в навигационных меню.

```ts
@Input({ required: true }) user!: User;
@Output() logout = new EventEmitter<void>();
```

---

### InviteManageCardComponent (`app-invite-manage-card`)

Карточка одного приглашения с двумя кнопками. Эмитит `invite.id` соответствующей кнопке.

```ts
@Input({ required: true }) invite!: Invite;
@Output() accept = new EventEmitter<number>();
@Output() reject = new EventEmitter<number>();
```

---

### EmptyManageCardComponent (`app-empty-manage-card`)

Пустая карточка-плейсхолдер (используется когда нет приглашений). Без inputs/outputs.

## Primitives

### AvatarComponent (`app-avatar`)

Аватар с опциональной обводкой и индикатором online.

```ts
@Input({ required: true }) url?: string;
@Input() size = 50;                 // размер в px
@Input() hasBorder = false;
@Input() isOnline = false;
@Input() onlineBadgeSize = 16;
@Input() onlineBadgeBorder = 3;
@Input() onlineBadgeOffset = 0;
```

`url` помечен `required: true` (через `@Input({ required: true })`), но тип `url?: string` — то есть Angular требует биндить `[url]`, но строгая типизация позволяет передать `undefined`. Это противоречие в декларации; компонент это терпит (сам подкладывает дефолтную картинку для `undefined`).

---

### BackComponent (`app-back`)

Кнопка «Назад». Если задан `path` — навигация по нему; иначе `location.back()`. `namespace` — опциональный текст (например, контекст «Назад в проект»).

```ts
@Input() path?: string;
@Input() namespace?: string;
```

---

### IconComponent — директива-атрибут `[appIcon]`

Рендерит SVG из спрайта (`assets/icons/symbol/svg/sprite.css.svg`), сгенерированного через `npm run build:sprite`. Использует `<svg><use href="#icon-<name>"/></svg>`.

**Inputs**

| Input        | Тип                 | Что                                                                                    |
| ------------ | ------------------- | -------------------------------------------------------------------------------------- |
| `icon`       | `string` (required) | имя иконки в спрайте                                                                   |
| `appSquare`  | `string`            | квадратный размер; автоматически выставляет `viewBox = "0 0 <s> <s>"` если он не задан |
| `appViewBox` | `string`            | `viewBox` напрямую                                                                     |
| `appWidth`   | `string`            | ширина (обновляет `viewBox[2]` если оно есть)                                          |
| `appHeight`  | `string`            | высота (обновляет `viewBox[3]` если оно есть)                                          |

**Использование**

```html
<i appIcon icon="task" appSquare="24"></i>
<i appIcon icon="phone" appWidth="20" appHeight="22" appViewBox="0 0 20 22"></i>
```

---
