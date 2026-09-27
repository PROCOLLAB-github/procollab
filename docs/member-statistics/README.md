<!-- @format -->

# Статистика участников: селективный перенос в PROD

База: `master`, `cbcb5bffbaeb13a37176411a3ebda035618a5879`.
Источник: DEV [#381](https://github.com/PROCOLLAB-github/procollab/pull/381),
merge `19927ec09d337a69eee63c7050bc6d46f89f79a4`.

Перенесена только финальная статистика участников. Merge-коммит DEV не включён
в историю PROD-ветки. Дополнительно усилен существующий тест независимости от
пагинации: изменение `membersTotalCount` не меняет глобальную статистику.

## Поведение и контракт

Данные проходят через HTTP adapter → repository → use-case → facade →
`MemberStatisticsCardComponent`. Прямого HTTP в `MembersComponent` нет.
Один запрос на открытие страницы: `GET /auth/public-users/stats/` без параметров.
Существующий interceptor преобразует snake_case в camelCase.

| Ответ API          | Модель Angular  | Подпись          |
| ------------------ | --------------- | ---------------- |
| `total`            | `total`         | Всего участников |
| `in_projects`      | `inProjects`    | В проектах       |
| `in_programs`      | `inPrograms`    | В программах     |
| `new_last_30_days` | `newLast30Days` | Новых за 30 дней |

Repository проверяет четыре неотрицательных безопасных целых числа.
Загрузка и ошибка отображаются как `—`, реальные нули — как `0`.
Большие числа форматируются через `Intl.NumberFormat("ru-RU")`.
Технические тела ошибок не попадают в интерфейс. Есть доступные подписи
и статус загрузки; используются существующие `appIcon`.

Статистика глобальная: fullname, skills, speciality, пагинация и смена layout
не меняют метрики и не вызывают повторный запрос. Старый shared `SoonCard`
не изменён; на этой странице он заменён статистикой.

Backend-источник: DEV #756. Считаются активные legacy MEMBER: все; уникальные
лидеры или collaborators публичных нечерновых проектов; уникальные участники
нечерновых программ; зарегистрированные с включительной границы последних
30 суток. Backend использует `Exists`/`Count`, один SQL при 10/100/1000 людях.
В ответе только четыре числа, без персональных данных. Эти определения
Angular не пересчитывает.

## Геометрия в браузере

Проверка выполнена 27 сентября 2026 года в Chrome 154.0.8037.57 на Windows,
высота viewport 1000 px, DPR 1. Сравнивались отдельные сборки exact master и
ветки переноса с одинаковыми синтетическими участниками. Использованы настоящие
`MembersComponent`, фильтры, карточки и SCSS оболочки office; навигация и данные
заменены локальными fixtures. Это проверка интерфейса в браузере, а не обращение
к работающему PROD API. HTTP mapping проверен отдельными контрактными тестами.

| Viewport, px | X сетки до | X сетки после | Ширина сетки до/после | Карточка W × H, px | Horizontal overflow |
| -----------: | ---------: | ------------: | --------------------: | -----------------: | ------------------: |
|         1440 | 365.828125 |    365.828125 |                   684 |          157 × 280 |                   0 |
|         1280 | 285.828125 |    285.828125 |                   684 |          157 × 280 |                   0 |
|         1024 |      201.5 |         201.5 |                 580.5 |          157 × 280 |                   0 |
|          768 |         16 |            16 |                   721 |          721 × 172 |                   0 |
|          414 |         16 |            16 |                   367 |          367 × 172 |                   0 |
|          390 |         16 |            16 |                   343 |          343 × 172 |                   0 |
|          375 |         16 |            16 |                   328 |          328 × 172 |                   0 |

На desktop sidebar ровно **157 px**. Host и карточка имеют `width: 100%`,
`max-width: 157px`, `min-width: 0`, `box-sizing: border-box`.
Ширина и X-позиция сетки до/после совпадают без допуска на округление.

При ширине меньше 1000 px используется тот же компонент, ширина равна ширине
списка, метрики расположены 2×2. Порядок: поиск → «Фильтры / Перейти в профиль»
→ статистика → участники. В стенде controls заканчиваются на Y=217,
статистика занимает Y=241…413, список начинается на Y=468.

Для каждой из семи ширин проверены **0, 9, 63, 999, 1 248, 12 345, 999 999**,
загрузка и ошибка: 63 сценария плюс 7 обычных отображений. Во всех случаях
horizontal overflow и внутренний overflow карточки равны нулю, её размеры
остаются теми же. Проверено отсутствие `SoonCard`.
Поиск, изменение фильтров, добавление второй порции карточек и переключение
mobile → desktop сохраняют один вызов статистики и те же значения.
Пагинация настоящего `MembersUIInfoService` дополнительно проверена в Vitest.

Полные машинные измерения: [browser-measurements.json](browser-measurements.json).

## Проверки

Окружение: Node 20.20.2, npm 10.8.2, зависимости из существующего lockfile.

| Проверка                                                     | Результат                                           |
| ------------------------------------------------------------ | --------------------------------------------------- |
| Целевые Vitest: facade, API contract, card, members, mobile  | 30/30, 5 файлов                                     |
| Полный `npm run test:ci`                                     | 1925/1925, 398 файлов                               |
| `npm run lint:ts`                                            | 0 ошибок; 6 предупреждений в неизменённых файлах    |
| Stylelint всех `projects/**/*.scss`, включая изменённые SCSS | Пройден                                             |
| Prettier изменённых файлов                                   | Пройден                                             |
| `npm run build:prod`                                         | Пройден; initial bundle 1.40 MB, transfer 314.36 kB |
| `git diff --check`                                           | Пройден                                             |
| Браузерные проверки                                          | 7 ширин, 70 отображений; исключений JavaScript нет  |

Полный suite выполнен перед дополнительными assertions пагинации; после их
добавления повторно прошли все 30 целевых тестов и ESLint изменённого теста.
Production-код после полного suite семантически не менялся.

На Windows production build запускался с `npm_config_script_shell`, указывающим
на Git Bash: штатный `build:sprite` использует glob в одинарных кавычках.
Скрипты проекта не менялись, итоговый спрайт совпадает с master.
Сборка сохраняет предупреждения Angular/Sass, CommonJS и budgets в существующих
частях приложения; ошибок сборки нет. В тестах и обеих браузерных сборках есть
предупреждение NG0912 о существующих компонентах `IconComponent`.

## Изменённые файлы приложения

Префикс путей: `projects/social_platform/src/app/`.

- `domain/member/member-statistics.model.ts`
- `domain/member/ports/member.repository.port.ts`
- `infrastructure/adapters/member/member-http.adapter.ts`
- `infrastructure/adapters/member/member-statistics-contract.spec.ts`
- `infrastructure/repository/member/member.repository.ts`
- `api/member/use-cases/get-member-statistics.use-case.ts`
- `api/member/facades/member-statistics.facade.ts`
- `api/member/facades/member-statistics.facade.spec.ts`
- `ui/pages/members/member-statistics-card/member-statistics-card.component.ts`
- `ui/pages/members/member-statistics-card/member-statistics-card.component.html`
- `ui/pages/members/member-statistics-card/member-statistics-card.component.scss`
- `ui/pages/members/member-statistics-card/member-statistics-card.component.spec.ts`
- `ui/pages/members/members.component.ts`
- `ui/pages/members/members.component.html`
- `ui/pages/members/members.component.scss`
- `ui/pages/members/members.component.spec.ts`
- `ui/pages/members/members-mobile.spec.ts`

Дополнительно включены этот отчёт, JSON измерений и 20 скриншотов. Member cards,
skills UI, fullname search, mobile filters, shared SoonCard, зависимости,
workflows и React не изменены.

## Скриншоты

| Ширина | До                                    | После                                    |
| ------ | ------------------------------------- | ---------------------------------------- |
| 1440   | [master](screenshots/before-1440.jpg) | [статистика](screenshots/after-1440.jpg) |
| 1280   | [master](screenshots/before-1280.jpg) | [статистика](screenshots/after-1280.jpg) |
| 1024   | [master](screenshots/before-1024.jpg) | [статистика](screenshots/after-1024.jpg) |
| 768    | —                                     | [статистика](screenshots/after-768.jpg)  |
| 414    | —                                     | [статистика](screenshots/after-414.jpg)  |
| 390    | —                                     | [статистика](screenshots/after-390.jpg)  |
| 375    | —                                     | [статистика](screenshots/after-375.jpg)  |

[0](screenshots/value-0.png) · [9](screenshots/value-9.png) ·
[63](screenshots/value-63.png) · [999](screenshots/value-999.png) ·
[1 248](screenshots/value-1248.png) · [12 345](screenshots/value-12345.png) ·
[999 999](screenshots/value-999999.png).

[Мобильный: большие числа](screenshots/mobile-large.jpg) ·
[загрузка](screenshots/mobile-loading.jpg) · [ошибка](screenshots/mobile-error.jpg).
