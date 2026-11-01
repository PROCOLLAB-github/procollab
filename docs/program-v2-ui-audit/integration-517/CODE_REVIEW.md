<!-- @format -->

# Дополнительное code review PR #517

Исходный head: `0a589f4cbacb100a186db05fb5044ed9a826107a`. Base: `9ef90b5824b857fe53d52c097e37b279b897d9bf`. Проверены TS-изменения и bindings затронутых flows относительно base, а не только CSS или прежний авторский отчет. Масштабный визуальный аудит не повторялся.

## Найденный дефект R1 — MAJOR, исправлен

[SolutionExpertsComponent.applyFilters](../../../projects/social_platform/src/app/ui/pages/program/management/experts/solution-experts.component.ts#L307) в `0a589f4c` всегда вызывал FormControl.setValue, даже при неизмененном значении. Подписки status/caseFilter сбрасывали выбор; status дополнительно сбрасывал страницу. В V1 [applyFilters](../../../projects/social_platform/src/app/ui/pages/program/management/experts/experts.component.ts#L564) уже проверяет изменение значения.

Воспроизведение: выбрать одно из двух решений одного кейса → открыть фильтры → применить тот же кейс. Выбор исчезает. Следующий [startAllocation](../../../projects/social_platform/src/app/ui/pages/program/management/experts/solution-experts.component.ts#L712) при пустом selection использует весь фильтр. Это может расширить область следующего preview; подтверждение остается отдельным шагом, но список целей уже иной. На реальном сервере ошибочные назначения не выполнялись.

Два новых unit-сценария на исходном коде упали: выбранные эксперты 21 → 0 и выбранные solution IDs [302] → []. После минимального исправления setValue вызывается только при реальном изменении; tests проверяют сохранение страницы/выбора и preview ids=[302]. Реальное изменение фильтра по-прежнему очищает скрытый выбор. API и структура интерфейса не меняются.

Исходные результаты: `filter-regression-before.json/.log`; финальные — `review-regression-tests.json/.log` в архиве интеграционного этапа. Это доказательство уровня кода/tests, не реальный organizer E2E.

## Проверенные цепочки

| Область | Что прослежено | Вывод code review |
| --- | --- | --- |
| Массовый выбор экспертов | ExpertRoster emits исходный ExpertRow; parents хранят Set ID. V1 selectedExpertRows и V2 bulk берут пересечение с filtered. Checkbox/link/menu не дают двойного toggle. | Отбор выполняется по expert ID и invitation ID, userId не подставляется. Выбор всех относится ко всему фильтру; 20 строк ограничивают только отображение. |
| Фильтрация | Отмена modal, draft/apply/reset, реальные изменения status/case/search, page reset. V1 сохраняет существующие project/expert/case фильтры. | R1 исправлен. Состояния draft и примененного фильтра разделены; API поиска заявок и query/debounce не менялись. |
| Массовые операции | EvaluationUseCase → EvaluationHttpAdapter → experts/bulk. Проверены mixed joined/pending, revision, expertIds, invitationIds и case scope. | Повтор/отзыв смешанного выбора блокируется. Добавлен тест точного payload для массового изменения кейсов. Server-side проверка атомарности без organizer сессии остается открытой. |
| Распределение V1 | Прежние selectedProjects, single replace / bulk add, revision, saved-score protection и shortage. | Обработчики не переписаны. Общий roster не участвует в вычислении Project assignments. |
| Распределение V2 | distributionSelection → request.ids → SolutionAllocation.preview → solutionIds/revision → отдельный apply по planToken. | Project IDs не вводятся. Shortage блокирует confirm; выбор нового эксперта сбрасывает старый preview. Обработчики preview/apply и серверные ограничения не менялись; исправлен только R1. |
| Ручные назначения V2 | options.expertId/revision, protected/eligible/ownTeam/submitted, selectedSolutions → saveApi. | Сохраненная оценка не снимается через UI; refresh после отказа перечитывает revision, сохраняет валидный выбор и не запускает apply сам. Нужна проверка сервера в гонке. |
| Выгрузка экспертов | Parents передают filtered, не visible/selected; exportExperts сохраняет числовые/null значения. | Состав выгрузки не ограничен страницей/чекбоксами. V2 использует Solution counters. Подробные подписи статусов заменили более общие подписи как представление. Добавлен unit-сценарий 21 строки. |
| Выгрузки результатов/аналитики | Неизмененные adapters/use-cases, case/field/search filters, cancellation, отсутствие limit/offset в export. | Новых handler/payload изменений нет. Unit-тест сохраняет фильтры; реальные файлы и серверная полнота требуют live приемки. |
| Аналитика | Общая progress-сводка получает только счетчики/события. V1 fetch прежний, V2 Solution analytics/assignments/scores. | Проценты округляются вниз как раньше; pending/completed, 0/false/comment сохраняются. Assignment response по C00 содержит полный массив results, а не новый client-side Project pager. |
| Настройки / заявки | Binding форм и dialogs → прежние handlers, Solution versions/snapshots, Project links, ProgramUpdated. | API/model/route/guard файлы PR не менял. Наличие неизмененного handler не доказывает серверную сохранность без round trip. |
| Права и scope | Busy/disabled, выбор ID, прямые routes и API; сверены unchanged adapters/domain/guards с base. | UI не подменяет server-side permissions. Анонимные реальные GET отклонены 401; organizer/expert/participant и foreign-object authorization не проверены. |

Иных конкретно воспроизведенных actionable findings в изменениях PR не найдено. Это ограниченный результат review: нельзя утверждать отсутствие серверных проблем или полную неизменность поведения по одним unit-тестам. Локальный checkout API не содержит весь актуальный Solution-management контур deployed dev; его старые Application/Submission-модели не использованы вместо C00 и реального dev. Backend не изменялся.

## Verification и ограничения

- Checked by source: перечисленные цепочки, base/head diff, handlers, ID, payload, cancellation и revision. Новая product-правка — только guard неизмененного фильтра V2.
- Checked by tests: 75 passed в шести релевантных файлах, включая четыре добавленных сценария. V1 41, V2 14, allocation 4, export 2, progress 9, Solution analytics 5. Это unit-тесты с doubles, не интеграция dev. Полный 3089-набор предыдущего этапа повторно не запускался.
- Checked by build: обычный `NG_BUILD_MAX_WORKERS=2 npm run build:prod`, exit 0 после R1; budgets/config не менялись. Адресные ESLint/Prettier и Solution type contract проверяются отдельно в results.json.
- Checked in browser with real dev: изолированный точный baseline, обычная login-форма, публичные Project/Solution GET, anonymous denial и redirect. Нет cookie injection, подмен ответов API, записи credentials, HAR или storageState.
- Not checked: все authenticated organizer/expert/participant writes и отрицательные сценарии от этих ролей; реальное сохранение, назначение/снятие, оценивание/пересчет, экспорт содержимого, ревизионные гонки и почтовый транспорт. Причина — нет авторизованной сессии; предусмотрен MANUAL.md.

Вердикт code review после R1: исправление проверено локально; полноценная интеграционная приемка и готовность к merge — **insufficient evidence**. Полный runtime verdict — README и MATRIX.csv, без замены NOT TESTED на PASS.
