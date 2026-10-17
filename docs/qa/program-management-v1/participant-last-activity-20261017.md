<!-- @format -->

# Последняя активность участника

Запрос организатора: добавить столбец «Дата последней активности», при отсутствии даты — «—».

## Scope и контракт

Источник — существующий `users.CustomUser.last_activity`, обновляемый при авторизованных
запросах к платформе. Это общая активность на платформе; учёт активности не меняется.
Сейчас `GET /programs/{id}/management/participants/` не возвращает дату активности.
Добавляется поле `last_activity` с ISO timestamp или `null`; остальные поля, поиск,
порядок, pagination и server-side organizer/object permissions сохраняются.
Миграции не нужны: поле уже существует. Публичные API участников не расширяются.

Angular получает `lastActivity` через существующий camelCase interceptor. Дата выводится
после «В программе с» в формате `dd.MM.yyyy HH:mm`, время по Москве (+03:00).
При `null` или отсутствующем поле API показывается «—» (совместимость rollout).
Расширяется существующая таблица и мобильная карточка строки, без нового UI pattern.

## Acceptance criteria

- A1: API организатора возвращает реальную last_activity для участника своей программы.
- A2: при отсутствии last_activity API возвращает null; UI показывает «—».
- A3: столбец отображает дату/время МСК, в том числе при переходе суток относительно UTC.
- A4: desktop и mobile сохраняют читаемость, поиск и pagination; доступ остаётся program-scoped.

План: API поле + regression test → Angular contract/table/widths + DOM test →
проверки и review → API dev deploy → frontend dev deploy → release smoke.

## Evidence

- Checked by source: поле добавлено только в защищённый management endpoint.
  `select_related("user")` уже существует, N+1 не добавлен. Учёт активности сохраняет
  существующий JWT throttle (по умолчанию 15 минут).
- Checked by tests: 22 local PostgreSQL API/auth activity tests PASS; 300 focused
  frontend tests / 37 files PASS. Новый API regression проверяет timestamp/null,
  новый DOM test — дату МСК с переходом суток, null и старый API без поля.
- Checked by build: Angular development build PASS, ESLint/Stylelint/Black/Flake8 PASS.
- Checked in browser: Chrome 1440×1000, 390×844, 360×844 с настоящим локальным
  Django/PostgreSQL. API timestamp/null, таблица из пяти столбцов, поиск и мобильная
  строка — PASS; горизонтального overflow и page errors нет.
- Not checked: авторизованный organizer API на dev, так как нет live-сессии.
  Полный backend suite и dev release проверяются через CI и anonymous smoke.

Скриншоты: [desktop](participant-last-activity-20261017/desktop.png),
[mobile](participant-last-activity-20261017/mobile.png).

## Requirement audit / review

| AC  | Verdict | Evidence                                                                   |
| --- | ------- | -------------------------------------------------------------------------- |
| A1  | PASS    | API JSON regression + real local API browser response                      |
| A2  | PASS    | API null with last_login present; DOM null/missing; browser dash           |
| A3  | PASS    | UTC 16.10 22:30 → МСК 17.10 01:30 in DOM and browser                       |
| A4  | PASS    | API scope tests; browser search and responsive table; unchanged pagination |

Review: BLOCKER/MAJOR/MINOR findings отсутствуют. Сохранены permissions, queries,
pagination, существующие DS table/mobile patterns и Mont. API extension совместимо
со старым фронтом; новый фронт поддерживает отсутствующее поле при поэтапной выкладке.
