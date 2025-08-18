<!-- @format -->

# UI Library - Библиотека компонентов пользовательского интерфейса

Эта библиотека содержит переиспользуемые Angular компоненты для построения пользовательского интерфейса приложения. Библиотека разделена на две основные категории: компоненты макета (layout) и примитивные компоненты (primitives).

## Структура проекта

\`\`\`
src/
├── lib/
│ ├── models/ # Модели данных
│ │ └── user.model.ts # Модель пользователя
│ └── components/ # Компоненты UI
│ ├── layout/ # Компоненты макета
│ │ ├── sidebar/ # Боковая панель навигации
│ │ ├── profile-control-panel/ # Панель управления профилем
│ │ ├── profile-info/ # Информация о профиле
│ │ ├── invite-manage-card/ # Карточка управления приглашениями
│ │ └── subscription-plans/ # Планы подписки
│ └── primitives/ # Базовые компоненты
│ ├── avatar/ # Аватар пользователя
│ ├── back/ # Кнопка "Назад"
│ └── icon/ # Иконки
└── public-api.ts # Публичный API библиотеки
\`\`\`

## Установка и использование

### Импорт компонентов

\`\`\`typescript
import {
SidebarComponent,
ProfileControlPanelComponent,
AvatarComponent,
IconComponent
} from '@uilib';
\`\`\`

### Использование в шаблонах

\`\`\`html

<!-- Боковая панель -->

<ui-sidebar
[navItems]="navigationItems"
[logoSrc]="logoUrl">
</ui-sidebar>

<!-- Аватар -->

<app-avatar
[url]="user.avatar"
[size]="50"
[isOnline]="user.isOnline">
</app-avatar>
\`\`\`

## Компоненты макета (Layout Components)

### SidebarComponent

Боковая панель навигации с логотипом и списком навигационных элементов.

**Входные параметры:**

- `navItems: NavItem[]` - массив элементов навигации
- `logoSrc: string` - путь к логотипу (обязательный)

**Интерфейс NavItem:**
\`\`\`typescript
interface NavItem {
link: string; // Ссылка для роутинга
icon: string; // Название иконки
name: string; // Отображаемое имя
}
\`\`\`

### ProfileControlPanelComponent

Панель управления профилем с уведомлениями, чатами и кнопкой выхода.

**Входные параметры:**

- `user: User | null` - данные пользователя (обязательный)
- `invites: Invite[]` - массив приглашений (обязательный)
- `hasNotifications: boolean` - наличие уведомлений (обязательный)
- `hasUnreads: boolean` - наличие непрочитанных сообщений (обязательный)

**Выходные события:**

- `acceptInvite: EventEmitter<number>` - принятие приглашения
- `rejectInvite: EventEmitter<number>` - отклонение приглашения
- `logout: EventEmitter<void>` - выход из системы

### ProfileInfoComponent

Отображение информации о профиле пользователя.

**Входные параметры:**

- `user: User` - данные пользователя (обязательный)

**Выходные события:**

- `logout: EventEmitter<void>` - выход из системы

### InviteManageCardComponent

Карточка для управления приглашениями в проекты.

**Входные параметры:**

- `invite: Invite` - данные приглашения (обязательный)

**Выходные события:**

- `accept: EventEmitter<number>` - принятие приглашения
- `reject: EventEmitter<number>` - отклонение приглашения

### SubscriptionPlansComponent

Модальное окно с планами подписки.

**Входные параметры:**

- `open: boolean` - состояние открытия модального окна
- `subscriptionPlans: SubscriptionPlan[]` - массив планов подписки (обязательный)

**Выходные события:**

- `openChange: EventEmitter<boolean>` - изменение состояния модального окна

## Примитивные компоненты (Primitive Components)

### AvatarComponent

Компонент для отображения аватара пользователя с поддержкой индикатора онлайн-статуса.

**Входные параметры:**

- `url?: string` - URL изображения аватара
- `size: number = 50` - размер аватара в пикселях
- `hasBorder: boolean = false` - наличие рамки
- `isOnline: boolean = false` - онлайн статус
- `onlineBadgeSize: number = 16` - размер индикатора онлайн
- `onlineBadgeBorder: number = 3` - толщина рамки индикатора
- `onlineBadgeOffset: number = 0` - смещение индикатора

### BackComponent

Кнопка "Назад" для навигации.

**Входные параметры:**

- `path?: string` - путь для перехода (опциональный, по умолчанию используется history.back())

### IconComponent

Компонент для отображения SVG иконок из спрайта.

**Входные параметры:**

- `icon: string` - название иконки (обязательный)
- `appSquare?: string` - размер квадратной иконки
- `appWidth?: string` - ширина иконки
- `appHeight?: string` - высота иконки
- `appViewBox?: string` - viewBox для SVG

## Модели данных

### User

Модель пользователя системы.

\`\`\`typescript
interface User {
id: number; // Уникальный идентификатор
email: string; // Email адрес
firstName: string; // Имя
lastName: string; // Фамилия
avatar: string; // URL аватара
isOnline: boolean; // Онлайн статус
isActive: boolean; // Активность аккаунта
onboardingStage: number | null; // Этап онбординга
speciality: string; // Специальность
userType: number; // Тип пользователя
timeCreated: string; // Время создания
timeUpdated: string; // Время обновления
verificationDate: string; // Дата верификации
}
\`\`\`

## Стилизация

Библиотека использует CSS переменные для темизации:

\`\`\`css
:root {
--white: #ffffff;
--black: #000000;
--accent: #your-accent-color;
--accent-dark: #your-accent-dark-color;
--grey-for-text: #your-grey-color;
--light-gray: #your-light-gray;
--red: #your-red-color;
--gold-dark: #your-gold-color;
/_ и другие переменные _/
}
\`\`\`

## Зависимости

Библиотека требует следующие зависимости:

- `@angular/core`
- `@angular/common`
- `@angular/router`
- `ng-click-outside` - для обработки кликов вне элемента
- Различные внутренние модули проекта (`@auth/services`, `@office/models`, etc.)

## Тестирование

Каждый компонент имеет соответствующий `.spec.ts` файл с unit тестами. Тесты используют Angular Testing Utilities и Jasmine.

Для запуска тестов:
\`\`\`bash
ng test ui
\`\`\`

## Сборка

Для сборки библиотеки:
\`\`\`bash
ng build ui
\`\`\`

Результат сборки будет в папке `dist/ui/`.

## Примеры использования

### Базовая боковая панель

\`\`\`typescript
// component.ts
export class AppComponent {
logoSrc = 'assets/logo.png';
navItems: NavItem[] = [
{ link: '/dashboard', icon: 'dashboard', name: 'Панель управления' },
{ link: '/projects', icon: 'projects', name: 'Проекты' },
{ link: '/profile', icon: 'user', name: 'Профиль' }
];
}
\`\`\`

\`\`\`html

<!-- template.html -->

<ui-sidebar
[navItems]="navItems"
[logoSrc]="logoSrc">

  <!-- Дополнительный контент после навигации -->
  <div afterNavItems>
    <a class="sidebar-nav__item" routerLink="/settings">
      <i appIcon icon="settings" appSquare="24"></i>
      Настройки
    </a>
  </div>
  
  <!-- Панель управления профилем -->
  <app-profile-control-panel
    [user]="currentUser"
    [invites]="userInvites"
    [hasNotifications]="hasNotifications"
    [hasUnreads]="hasUnreadMessages"
    (acceptInvite)="onAcceptInvite($event)"
    (rejectInvite)="onRejectInvite($event)"
    (logout)="onLogout()">
  </app-profile-control-panel>
</ui-sidebar>
\`\`\`

### Использование аватара с онлайн статусом

\`\`\`html
<app-avatar
[url]="user.avatar"
[size]="60"
[isOnline]="user.isOnline"
[hasBorder]="true">
</app-avatar>
\`\`\`

/\*\*

- Модель пользователя системы
- Содержит всю необходимую информацию о пользователе для отображения в UI компонентах
  _/
  export interface User {
  /\*\* Уникальный идентификатор пользователя _/
  id: number;

/\*_ Email адрес пользователя _/
email: string;

/\*_ Имя пользователя _/
firstName: string;

/\*_ Фамилия пользователя _/
lastName: string;

/\*_ URL изображения аватара пользователя _/
avatar: string;

/\*_ Статус онлайн (true - пользователь в сети, false - оффлайн) _/
isOnline: boolean;

/\*_ Статус активности аккаунта (true - активен, false - заблокирован/неактивен) _/
isActive: boolean;

/\*_ Текущий этап процесса онбординга (null если онбординг завершен) _/
onboardingStage: number | null;

/\*_ Специальность/профессия пользователя _/
speciality: string;

/\*_ Тип пользователя (числовой код, определяющий роль в системе) _/
userType: number;

/\*_ Дата и время создания аккаунта в ISO формате _/
timeCreated: string;

/\*_ Дата и время последнего обновления профиля в ISO формате _/
timeUpdated: string;

/\*_ Дата верификации аккаунта в ISO формате _/
verificationDate: string;
}
