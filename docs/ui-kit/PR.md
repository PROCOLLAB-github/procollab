<!-- @format -->

После responsive-адаптации одинаковые элементы платформы использовали отдельные реализации и локальные цвета, размеры и состояния. Общий UI Kit теперь задаёт кнопки и поля от 44 px, типографику, карточки, вкладки, диалоги, сообщения и заголовки страниц. Например, loading сохраняет название действия и блокирует повторную отправку; короткие подписи и CTA в карточках помещаются на mobile и desktop.

**База PR:** `dev`. В PR включён предыдущий responsive-коммит `bc4940c5`, который ещё не находится в удалённой `dev` (`9acb7ce2`), и новый коммит UI Kit. Скриншоты «до» показывают responsive baseline, «после» — UI Kit. Предыдущий этап описан в [responsive README](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/responsive/README.md). Этап UI Kit не изменяет API, facades, router declarations или permissions; сохранены тексты и доменные действия.

### Компоненты

| Семейства                                                        | Общий источник и миграция                                                                                                                                         |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button, Icon, Avatar, Loader                                     | Одна реализация в `@uilib`; старые импорты реэкспортируют тот же класс. Native ButtonDirective использует тот же foundation, сохраняя form/ARIA/HTMLElement refs. |
| Input, Textarea, Select, Dropdown, Search, Autocomplete          | Общие control tokens, focus/error/disabled; сохранены CVA/валидация/overlay. Select поддерживает клавиатурное открытие и disabled.                                |
| Checkbox, Radio                                                  | Общие состояния; семантический Checkbox с клавиатурой и native/rich radio adapters.                                                                               |
| Tabs, Page Header, Back                                          | Общие Tabs с active/disabled/mobile scroll; Bar/BarNew и navigation adapters. PageHeader поддерживает title/description/breadcrumbs/actions.                      |
| Modal/Dialog, Drawer, Card                                       | Общие sizes/surface/padding/scroll/focus; DialogHeader/Body/Footer и Card/Drawer adapters, сохранены доменные layouts и правила закрытия.                         |
| Badge/Tag, Table, Pagination                                     | VacancyStatus и старый kanban Badge — адаптеры; доступность курса — Badge; таблицы и пагинация аналитики используют общие стили.                                  |
| Filters, Form layouts, Empty/Loading/Error, Alerts/Notifications | Общие adapters, StateComponent и семантические tokens; существующий Snackbar.                                                                                     |

Переведены 80 HTML-шаблонов; удалены 6 дублирующих HTML/SCSS. Аудит подтверждает 10 канонических компонентов и отсутствие локальных hex/rgb/hsl цветов в component SCSS. Полные списки и правила: [UI-KIT.md](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/UI-KIT.md), [audit.json](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/audit.json), [REPORT.md](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/REPORT.md).

### Страницы

- Office feed: фильтры, новости/диалог, формы, состояния и drawer.
- Projects: PageHeader/CTA, dashboard/my/subscriptions/invites/all, карточки, шаги создания/редактирования, команда и приглашения.
- Vacancies: PageHeader/Tabs, карточки, фильтры, отклики/диалог и статусы.
- Programs: список/карточки, заявка и команда, экспертная оценка, аналитика и пагинация.
- Courses: заголовок, карточки/Badge, варианты заданий и результаты.
- Members: заголовок, фильтры/диалог, карточки и состояния.
- Profile: длинное ФИО в PageHeader, вкладки/формы редактирования, общие действия.
- Auth/Onboarding и общие widgets: поля, формы, состояния, чат, новости, файлы и region/skills selectors.

### Проверки

- Production build — успешно.
- Полный Vitest — **2002 тестов / 406 файлов**, затем **30 тестов** затронутых финальными layout-правками компонентов.
- ESLint — 0 ошибок (6 прежних warnings); Stylelint — 0 ошибок.
- **912 измерений**: 57 URL/состояний форм × 16 ширин (320, 360, 375, 390, 430, 749, 750, 768, 820, 999, 1000, 1001, 1024, 1280, 1440, 1920 px); без overflow/pageerror/console.error. Последние изменения дополнительно проверены на 12 основных экранах.
- **24 функциональных запусков** (12 сценариев × 320/390 px), включая формы, отправку, загрузку файлов, select/datepicker, задания курсов и таблицы. Редактор профиля повторно проверен после финальной компоновки заголовка.
- **36 проверок геометрии**: цели ≥44 px, CTA внутри карточек, иконка меню не сжата, короткие подписи не переносятся.
- **24 пар скриншотов** до/после на 320/390/1440 px. Логи, JSON и все пары — в [REPORT.md](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/REPORT.md).

### Скриншоты

<details>
<summary>Лента: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                              | После (UI Kit)                                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Лента до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/feed-390.png">   | <img width="270" alt="Лента после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/feed-390.png">   |
| 1440 px  | <img width="540" alt="Лента до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/feed-1440.png"> | <img width="540" alt="Лента после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/feed-1440.png"> |

</details>

<details>
<summary>Проекты: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                    | После (UI Kit)                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Проекты до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/projects-390.png">   | <img width="270" alt="Проекты после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/projects-390.png">   |
| 1440 px  | <img width="540" alt="Проекты до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/projects-1440.png"> | <img width="540" alt="Проекты после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/projects-1440.png"> |

</details>

<details>
<summary>Вакансии: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                      | После (UI Kit)                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Вакансии до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/vacancies-390.png">   | <img width="270" alt="Вакансии после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/vacancies-390.png">   |
| 1440 px  | <img width="540" alt="Вакансии до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/vacancies-1440.png"> | <img width="540" alt="Вакансии после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/vacancies-1440.png"> |

</details>

<details>
<summary>Программы: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                      | После (UI Kit)                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Программы до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/programs-390.png">   | <img width="270" alt="Программы после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/programs-390.png">   |
| 1440 px  | <img width="540" alt="Программы до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/programs-1440.png"> | <img width="540" alt="Программы после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/programs-1440.png"> |

</details>

<details>
<summary>Курсы: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                 | После (UI Kit)                                                                                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 390 px   | <img width="270" alt="Курсы до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/courses-390.png">   | <img width="270" alt="Курсы после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/courses-390.png">   |
| 1440 px  | <img width="540" alt="Курсы до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/courses-1440.png"> | <img width="540" alt="Курсы после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/courses-1440.png"> |

</details>

<details>
<summary>Участники: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                     | После (UI Kit)                                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Участники до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/members-390.png">   | <img width="270" alt="Участники после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/members-390.png">   |
| 1440 px  | <img width="540" alt="Участники до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/members-1440.png"> | <img width="540" alt="Участники после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/members-1440.png"> |

</details>

<details>
<summary>Профиль: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                   | После (UI Kit)                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Профиль до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-390.png">   | <img width="270" alt="Профиль после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-390.png">   |
| 1440 px  | <img width="540" alt="Профиль до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-1440.png"> | <img width="540" alt="Профиль после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-1440.png"> |

</details>

<details>
<summary>Редактирование профиля: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                                       | После (UI Kit)                                                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Редактирование профиля до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-edit-390.png">   | <img width="270" alt="Редактирование профиля после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-edit-390.png">   |
| 1440 px  | <img width="540" alt="Редактирование профиля до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-edit-1440.png"> | <img width="540" alt="Редактирование профиля после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-edit-1440.png"> |

</details>

### Известные ограничения

Browser QA выполнена в Chrome с синтетическими API fixtures: записи в реальный backend, письма, WebSocket и права конкретного аккаунта не проверялись. Физические Safari iOS/Chrome Android, клавиатура и системные pickers требуют проверки на устройствах. Некоторые внешние изображения fixtures недоступны на обеих версиях. В build остаются прежние Sass/CommonJS/budget warnings. Канбан остаётся отключён существующими маршрутами; адаптеры проверены сборкой/unit suite. Специальный контент карточек, графиков и заданий сохраняет доменные layouts поверх общего UI Kit.
