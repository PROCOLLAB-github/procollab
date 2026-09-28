<!-- @format -->

# Analytics → Case drilldown: итоговый review и handoff

Дата: 28.09.2026. Последовательность: procollab-angular → verification → procollab-review → procollab-pr.
Вердикт: **READY TO MERGE INTO DEV** в пределах проверенного scope; live dev acceptance выполняет пользователь.
Требования: [approved specification / AC01–AC19](../feature-specs/analytics-case-drilldown.md).
Backend: [api#760](https://github.com/PROCOLLAB-github/api/pull/760), target `dev`, base `29be99d`.
Angular: ветка `feature/dev-analytics-case-drilldown-angular`, target `dev`, base `69f84902`.
Исходная backend-работа сохранена в `608bf09`; в dev перенесены только изменения feature,
с адаптацией имён существующих модулей. Angular base обновлена без конфликтов и потери изменений.

## Результат и scope

Расширены существующие Analytics / AnalyticsDrilldown: selected, without_case, компактные метрики,
четыре колонки, поиск, pagination, общий и scoped XLSX. Новых routes, modal/table систем нет.
Case export всегда относится ко всему bucket; search и страница на него не влияют.
Without_case доступен без definition/options при наличии проектов. Staff UI gate и evaluation rules сохранены.
React, Figma, Design System и permissions не изменены. Merge и deploy не выполнялись.

Изменённые области:

- Backend: `services/case_analytics.py`, новый `services/project_case_drilldown.py`,
  `serializers/project_case_drilldown.py`, `services/exports.py`, `views.py`, feature tests и API/review docs.
- Angular domain/transport: `program-case-analytics.model.ts`, repository port/repository/HTTP adapter,
  два use-case, `program-case-projects.service.ts`, `program-case-analytics.ts`.
- Existing UI: Analytics и AnalyticsDrilldown `.ts/.html/.scss`, drilldown/info facade integration.
- Проверки: новые facade/use-case/HTTP/component/utility tests и fixture; существующие analytics tests
  дополнены dependency provider, scope/click assertions; `vitest.config.ts` исправляет test environment.
- Документация: approved specification, этот audit, восемь QA screenshots. Debug harness/logs в PR не включены.

Runtime-contract проверяется до включения export и повторно непосредственно перед запросом файла.
HTTP 200 с legacy/malformed DTO либо неправильным scope не разрешает выгрузку.
Смена кейса/программы, закрытие modal и destroy отменяют list и export; поиск отменяет только list.

## API

Существующие `GET /programs/{id}/projects/` и `GET /programs/{id}/export-projects/`:
`view=case_analytics&case_scope=all|selected|without_case`; для selected обязателен exact `case_name`.
List допускает `search`, `limit` (1–100, default 25), `offset` (>=0); export их отвергает.
Неизвестные, повторные, пустые и несовместимые параметры дают 400, без fallback на all.
Response: `count/next/previous/results`, `selection`, `cases_configured`, `submission_applicable`, `case_metrics`.
Строка содержит project/program-project IDs, название, регион, презентацию, typed case, лидера,
размер команды, linked/submitted dates и raw submitted flag. Angular использует существующий camelcase interceptor.
`Project.presentation_address` — единственный источник презентации; дополнительный ProjectDetail не запрашивается.
XLSX содержит явный «Кейс», полную ссылку и literal text; legacy list/export без view сохраняются.
[Полный API contract](https://github.com/PROCOLLAB-github/api/blob/feature/dev-analytics-case-drilldown-backend/docs/analytics-case-drilldown-api.md).

## Acceptance criteria audit

Все строки ниже проверены по исходным требованиям, коду и фактическим запускам, а не по авторскому summary.
Сокращения: B — `api/partner_programs/tests/test_project_case_drilldown.py`;
F — Angular `api/program/facades/detail/program-case-projects.service.spec.ts`;
C — `ui/pages/program/detail/analytics/drilldown/analytics-case.component.spec.ts`;
U — `api/program/use-cases/program-case-projects.use-case.spec.ts`;
H — `infrastructure/adapters/program/program-case-http.integration.spec.ts`.
Angular пути отсчитываются от `projects/social_platform/src/app/`.

| AC   | Статус | Конкретное evidence                                                                                                                                                 |
| ---- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | PASS   | Analytics component click tests для обычного, without и zero case; реальные button semantics; browser click/Enter/Space, title/scope.                               |
| AC02 | PASS   | B `test_selected_projection_and_full_bucket_metrics`, classifier parity; facade отображает server count и full-bucket metrics.                                      |
| AC03 | PASS   | B projection/null-presentation; C selected проверяет ровно четыре колонки и явное отсутствие презентации; URL из project DTO.                                       |
| AC04 | PASS   | B projection и constant-query assertions; C лидер/команда/submission; HTTP adapter вызывает один scoped list, без ProjectDetail.                                    |
| AC05 | PASS   | B classifier parity для missing/blank/whitespace/obsolete/nonexact и настоящего option «Без выбранного кейса»; typed selection сохраняется в Angular.               |
| AC06 | PASS   | B without-definition/options/empty-program; Analytics component tests и C without_case; browser without_case при отсутствующей конфигурации.                        |
| AC07 | PASS   | B pagination/full exports: полный all workbook, каждый link один раз, явный Case и полная презентация; F all; browser общий download.                               |
| AC08 | PASS   | B full exports (>25 строк); F search/no-results сохраняет full metrics/export; U/H export query без search/limit/offset; browser selected/without downloads.        |
| AC09 | PASS   | B legacy list/all/submitted; существующие test_exports, filters, case/manager/attention/not-submitted/assignment suites; прежние Angular drilldown tests.           |
| AC10 | PASS   | B pagination/search; F offset reset/range/retry; browser Enter, очистка поиска, no results и page 2.                                                                |
| AC11 | PASS   | B permission matrix: manager, чужой manager, expert, participant, anonymous, staff/superuser; прежний UI gate source diff; U/C 401/403/404.                         |
| AC12 | PASS   | B `test_same_project_in_two_programs_has_independent_case_submission_and_dates`: scoped case/flags/dates в list и workbook.                                         |
| AC13 | PASS   | B noncompetitive/null/historical-date assertions; C «Не требуется», отсутствие evaluation; browser noncompetitive.                                                  |
| AC14 | PASS   | U/C контролируемые network/invalid/unauthorized/forbidden/not-found/unsupported; browser loading/empty/no-results/error/retry; ошибка не подменяется нулями.        |
| AC15 | PASS   | F отдельные late Subjects для case/program/close/destroy, list/export unsubscribe и duplicate click; C close/program; существующий route cancellation test.         |
| AC16 | PASS   | Browser 1440×1000, 390/320/768 px, длинные русские названия, mobile labels без horizontal overflow, Tab/Shift+Tab trap, Escape/focus return; Mont computed style.   |
| AC17 | PASS   | B strict negative query matrix; U malformed/wrong-scope/legacy rejection; H реальный HTTP+interceptor: legacy 200 не вызывает export.                               |
| AC18 | PASS   | B workbook assertions: фиксированные headers, полный URL, ISO dates, order, header-only, literal `= + - @` и Excel error values; filename tests + browser download. |
| AC19 | PASS   | B query/write capture: overview 4 SQL; list <=10 / export <=7 на 1 и 100 строках, serializer 0 дополнительных SQL; writes отсутствуют.                              |

PASS относится к указанным способам проверки. Это не приёмка live dev/production или сертификация accessibility.

## Visual continuity / Impeccable

Production references по исходному Angular коду: Analytics «Кейсы»; AnalyticsDrilldown attention;
AnalyticsDrilldown assignments. Сохранены Mont, белый modal, прежние border/radius/tokens,
тонкие разделители таблицы, вторичный серый текст, существующие primary/outline Button и search input.
Расширяется существующий AnalyticsDrilldown pattern. Новые DS primitives/tokens не понадобились.
Figma: [section и семь approved states](../feature-specs/analytics-case-drilldown.md#approved-design).
Сопоставлены side-by-side полученные Figma screenshots и локальный runtime desktop/mobile.
Live deployed production reference недоступен; visual baseline взят из существующего кода.

Impeccable применён как secondary quality layer: Operate, layout, critique и refinement/polish.
**Impeccable refinement must preserve the incumbent PROCOLLAB visual world.**

Три приоритетных critique findings устранены:

1. Экспорт с длинным русским label сжимался в маленьком Button: использован canonical big variant,
   220 px desktop / полная ширина mobile; понятен приоритет действия.
2. Shared modal style уменьшал case modal до 712 px: case-only body selector восстанавливает approved 880 px,
   без изменения остальных modal; таблица сохраняет рабочую плотность.
3. На mobile «Найти» конкурировал с полем, «Очистить» переносился отдельно: input занимает строку,
   действия сгруппированы ниже; порядок чтения и focus совпадает с DOM.

Checklist: hierarchy ✓; cognitive load ✓; grouping/rhythm ✓; density ✓; component consistency ✓;
loading/empty/no-results/error/disabled ✓; responsive ✓; semantics/keyboard/focus ✓;
нет новых gradients, вложенных card grids, декоративных pills или motion ✓.
Impeccable detect сообщил только существующий attention side border; он сохранён по production priority.
Полная проверка screen reader, zoom и WCAG contrast не выполнялась; новые цветовые tokens не вводились.

Screenshots: [overview](analytics-case-drilldown/overview-desktop.png),
[selected](analytics-case-drilldown/selected-desktop.png), [without](analytics-case-drilldown/without-desktop.png),
[loading](analytics-case-drilldown/loading-desktop.png), [empty](analytics-case-drilldown/empty-desktop.png),
[no results](analytics-case-drilldown/no-results-desktop.png), [error](analytics-case-drilldown/error-desktop.png),
[mobile 390](analytics-case-drilldown/selected-390.png).

## Фактически выполненные проверки

- Backend local PostgreSQL 18 ICU und: 187 feature/regression tests PASS; после усиления XLSX header assertion — повторные 13 PASS.
- [Backend PostgreSQL 15 CI](https://github.com/PROCOLLAB-github/api/actions/runs/36462349748): полный suite **933 tests PASS**,
  Django/model/migration checks и миграции на пустую БД PASS; отдельный Lint job PASS.
- Angular на актуальной base `69f84902`: `npm run test:ci -- --maxWorkers=4` — **400 files / 1934 tests PASS**, 123.83 s.
  Включены новые HTTP integration tests с настоящим camelcase interceptor и блокировкой legacy ответа.
- `npm run build:pr` — PASS; существующие Sass deprecation warnings остаются.
- `npm run lint:ts` — PASS, 0 errors / 6 существующих unused-disable warnings вне feature.
- Prettier: **1583 Git-файла PASS** с теми же repository config/ignore после нормализации CRLF → LF в памяти.
  Обычный `npm run format:check` на Windows working tree дал FAIL из-за CRLF и локального `.cache` harness;
  исходные файлы вне feature не форматировались. Linux checkout получает LF, debug cache в PR отсутствует.
- Browser QA: реальные Analytics/AnalyticsDrilldown/shared components и facades в изолированном локальном harness;
  mock repository/API fixtures. Проверены семь состояний, zero/noncompetitive, поиск/page 2, три scope выгрузки,
  legacy contract blocking, keyboard/focus и отсутствие JS errors. Это не live full-stack e2e.
- `git diff --check` и source/diff review выполнены для feature scope.

Первый backend-прогон на collation C выявил ошибки кириллического поиска среды; ICU-прогон прошёл без изменения поиска.
Первый Angular runner смешивал Node/Vite экземпляры Angular (NG0401/NG0203); `vitest.config.ts` теперь
inline-ит Angular и Angular consumers. Версии dependencies и runtime loading не изменялись.
Существующие три исключения Vitest сохранены; тесты feature не исключались.

## Findings и границы проверки

После исправлений открытых BLOCKER / MAJOR / MINOR в feature не осталось.
Помимо visual findings исправлен conditional case branch, чтобы прежний assignments state не рендерился одновременно.
Backend XLSX headers сравниваются с literal ожидаемым списком, а не с константой exporter.
Изменения тестовой конфигурации обоснованы воспроизводимыми runner errors и проверены полным suite.

Не проверено: live dev/production data и deployed SHA; full-stack browser с настоящим auth/API;
production image/build; Excel GUI; production-scale память/время XLSX; полный screen-reader/zoom/contrast audit.
Корректность workbook проверена чтением openpyxl; XLSX download — browser fixture.
Legacy backend push-workflow [CI / Tests и Lint](https://github.com/PROCOLLAB-github/api/actions/runs/36462314549) также PASS.
У Angular нет pull_request workflow: существующие workflows запускаются на push в dev/master и выполняют deploy.
Они намеренно не запускались вручную. Локальная среда Angular — Node 24.18.0; CI Node 20 отдельно не проверялся.

## Порядок merge и проверка dev пользователем

1. Сначала backend PR в `dev`. Проверить list `view=case_analytics` и server-side permissions.
2. Затем Angular PR в `dev`. Старый backend оставляет новый export заблокированным; list/export должны выпускаться вместе.
3. Под manager открыть selected / without_case / zero case; сверить counts, leader/submission и презентации.
4. Применить поиск, перейти на страницу 2; сравнить case XLSX с полным bucket, общий XLSX — со всеми кейсами.
5. Проверить missing presentation, отсутствие options, noncompetitive, mobile и Escape/focus return.
6. Прямым API-вызовом проверить отказ для чужой программы/participant; убедиться, что прежние exports и drilldowns работают.

Migration не требуется. Решение о production принимается после проверки dev пользователем.
