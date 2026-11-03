<!-- @format -->

# Воспроизведение итоговых проверок

Актуальный отчет — [ACCEPTANCE.md](ACCEPTANCE.md). Рабочий каталог — корень Angular checkout. Node 24.19.0, Angular 20.3, Chromium `/usr/bin/chromium`. Playwright предоставлен средой; новая зависимость приложения не добавлена.

## Стандартная сборка

```sh
NG_BUILD_MAX_WORKERS=2 npm run build:prod
python3 docs/program-v2-ui-audit/serve-production.py
PROGRAM_UI_BASE=http://127.0.0.1:4365 WIDTHS=390,1440 SCREENS=projects,experts,distribution,analytics node docs/program-v2-ui-audit/browser-check.cjs production-acceptance
PROGRAM_UI_BASE=http://127.0.0.1:4365 WIDTHS=390,1440 node docs/program-v2-ui-audit/acceptance-check.cjs production-acceptance
```

Build exit 0. Исходные production optimization, fonts inlining и budgets сохранены. Сервер раздает только локальный стандартный `dist/social_platform`, не публикует его. Браузерные скрипты перехватывают внешние API/WebSocket и используют fixtures, в том числе когда в production bundle указан production API. Это не проверка настоящего production сервиса.

Исторические font/CSS failures на `9ef90b58` и `44761cdc` сохранены в архиве отдельно. Они не являются текущим результатом. Обходной диагностический build-скрипт удален из финального checkout.

## Браузер и снимки

```sh
NG_BUILD_MAX_WORKERS=2 npx ng serve social_platform --host 0.0.0.0 --port 4200 --no-open
node docs/program-v2-ui-audit/browser-check.cjs acceptance-final
node docs/program-v2-ui-audit/interaction-check.cjs acceptance-final
node docs/program-v2-ui-audit/acceptance-check.cjs acceptance-final
node docs/program-v2-ui-audit/state-check.cjs
node docs/program-v2-ui-audit/visual-contract.cjs
```

Съемка основных страниц ждет populated selectors, спокойную сеть и Mont. Итог: 140 main, 400 interactions, 75 conformance, 40 states, 5 controls. Ширины 320/390/768/1440/1920. `WIDTHS`, `SCREENS`, `CASES`, `ACCEPTANCE_CASES` позволяют адресный повтор. Внутри Playwright нет реальных credentials/записей; fixtures включают действующие C00 Solution документы, 25 экспертов и значения 0/false/comment.

Сравнение этого этапа снято с неизмененного worktree `44761cdc`, запущенного на 4202:

```sh
PROGRAM_UI_BASE=http://127.0.0.1:4202 node docs/program-v2-ui-audit/browser-check.cjs acceptance-before
PROGRAM_UI_BASE=http://127.0.0.1:4202 PROGRAM_UI_BASELINE=1 node docs/program-v2-ui-audit/acceptance-check.cjs acceptance-before
```

`PROGRAM_UI_BASELINE=1` записывает исходную геометрию, а не объявляет старые presets соответствующими Figma. Три исходные mobile проверки открытия V1 assignment не проходят из-за исправленного дефекта позиционирования; baseline failures сохранены. Финальные результаты объединяют последние адресные повторы по version/screen-or-scenario/width. Исторический первоначальный before `9ef90b58` и after `44761cdc` остаются в первой галерее отдельно.

## Тесты и код

```sh
PROGRAM_UI_TEST_OUTPUT=/workspace/artifacts/program-v2-ui-audit/followup/tests python3 docs/program-v2-ui-audit/run-tests.py
npm run test:solution-contract
git diff --check
```

Набор Vitest запускается по восемь файлов, один fork worker, heap 1536 MB; конфигурация и три исходных exclusions неизменны. Полный набор 498 файлов/3089 тестов был выполнен; семь selectors × исправлены на доступное имя кнопки, затем четыре затронутых файла повторены (107 passed). Сводка содержит последние исходы каждого файла, исходные логи и replay доступны в архиве. Assertions lifecycle/focus сохранены.

ESLint выполнен для всех измененных TS относительно dev, Stylelint без auto-fix — для всех SCSS, Prettier — для TS/HTML. SCSS исключен действующим prettierignore и проверяется Stylelint. Глобальные auto-fix/format не запускаются; pre-commit hook с глобальным `lint:scss --fix` заменен адресными проверками перед commit.

## Figma, dev и галереи

Figma проверяется через MCP исходного файла `tvog0fpEgWgEtr7KUTjbyE`; карта — figma-inventory.json. Свежие PNG и метрики текущего этапа сохранены в полном архиве. Нельзя заменять их автоматически нарисованным прототипом или выдавать снимки fixtures за live интеграцию.

Read-only dev probes: `/programs/`, детали 4/49/50/51, опубликованные Project/Solution — 200; управленческие endpoints — 401 без organizer сессии. Изменяющих запросов к реальному сервису нет. После получения авторизованного dev доступа отдельно требуется полный organizer прогон из ACCEPTANCE.md.

```sh
python3 docs/program-v2-ui-audit/build-gallery.py
GALLERY_BEFORE=acceptance-before GALLERY_AFTER=acceptance-final GALLERY_OUTPUT=acceptance-gallery.html GALLERY_BASELINE=44761cdc python3 docs/program-v2-ui-audit/build-gallery.py
```

Открыть gallery.html или acceptance-gallery.html можно автономно: ссылки на локальные PNG, данные встроены, внешних зависимостей/fetch нет. В Cloud браузер блокирует file://, поэтому для ручной проверки использовалась локальная HTTP-раздача. В git оставлены основные пары desktop/mobile; полный архив содержит все 14 экранов/пять ширин и вложенные состояния. Проверка ZIP и SHA256 входит в финальную подготовку.
