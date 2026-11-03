<!-- @format -->

## Преемственность интерфейса, итог 03.11.2026

Весь набор вкладок и 7 разделов настроек V1/V2 сверен на 1440/390px, отдельные длинные/mobile состояния 360px. Действуют Mont и общие компоненты доведенного Project UI; VE01–VE06 не утверждались. Реальные повторные проверки 9c92/20ea выполнены, включая responsive coverage table, отступы и фильтр. Полная область и приватные доказательства перечислены в [VISUAL_EXCEPTIONS](VISUAL_EXCEPTIONS.md).

Последний source/runtime `ffe677f5cefb4f2412f4b513954269ee1d846a10`:5 CSS-строк убирают разрывы слов в мобильных итогах оценивания и горизонтальную полосу tooltip. Обе версии 360px, нижняя подсказка 390px, Enter/Escape/outside проверены.13 существующих tests/2files, scoped stylelint/Prettier и штатный prod build PASS. Ранее 68/3 и 12/2 (5 пересекаются) не суммируются.

Браузер восстановлен, draft25/приглашение 37/вступление завершены обычными интерфейсами; flag49=false. Итоговый вердикт NOT READY обусловлен серверными R9/R11 и явно ограниченными NOT TESTED, а не прежней остановкой браузера.

### R8 — отправитель Project invitation, исправлен

До исправления `utils/inviteToProjectMapper.ts` брал `invite.user` (recipient). Реальный pending 126 имел sender84/recipient59, а карточка называла 59 приглашающим. Файл до исправления совпадал с base: это существовавшая ошибка, не доказанная регрессия PR. В 8d36 mapper использует firstName/lastName `invite.sender` с русским fallback Пользователь. API, стили и роли не менялись.

Пройдены 15 существующих тестов InviteRepository/GetMyInvites/AcceptInvite, ESLint, Prettier и обычный prod build с прежними budgets. Реальный reload pending 126 показал sender84; затем обычное принятие POST 200 и команда 403 из 84/59. Повторного письма ради ретеста не было.

### R9 — P2, OPEN: дубль капитана в backend XLSX draft

Повтор на реальном draft25 после вступления 341: UI2 участника, workbook Решения teamSize2, Команды 3 строки с userIds84/84/341. Ранее 21/84 давал две строки при размере 1. Frontend сохраняет готовый Blob, строк не создает.

Доступный backend `SolutionAnalyticsContext.team()` явно добавляет капитана, затем все `solution.members.all()`, где captain уже существует. `solution_program_report.write_solutions()` считает размер через множество ID, но пишет все строки команды. Три релевантных файла совпадают с ранее сообщенным dev image cf48cd7; свежий image этого цикла не запрашивался. Доступный backend checkout не изменялся.

Приватный `R9-backend-proposed.patch` добавляет исключение captain из membership-компрехеншена. Pure Python method regression на настоящем извлеченном методе: до 84/84/341, после 84/341; роль участника, отсутствие membership капитана и submitted snapshot сохраняются. Это не Django/DB suite и не исправление dev. Нужны отдельное backend изменение и реальный повтор.

### R11 — P1, OPEN: аудитория сертификатов игнорирует Solution

На ffe6 реальный GET49/management/certificates/200 вернул eligible_counts all5/submitted0 и draft.audience=submitted. В 49 сданы Solution7/19/20, но UI показывает 0 получателей. Выдача/отправка не запускались.

Backend `services/certificates.py:recipients()` фильтрует участников через submitted PartnerProgramProject и Project Collaborator, без ветки Solution. Клиент отображает серверный счетчик. Нужен серверный расчет по сданным Solution с проверкой состава/snapshot и admin-интерфейса по backend AGENTS; подмена числа только в клиенте не исправляет аудиторию. Принадлежность R9/R11 к изменениям frontend PR не установлена.

### Серверные отрицательные сценарии

На 8d36 V1 grade/removal race:POST project_ids403/expert_ids[] получил 409 после оценки 201; свежий редактор защищает 64 checked/disabled, reload эксперта сохраняет 0/Нет/comment. Отдельно согласованный stale team remove59 после сдачи 403: DELETE 409 с русским сообщением, свежая команда сохраняет 84/59. V1 transport pool=[95] не добавил собственного 95 к 403 и дал shortage 2; общий preview отменен без apply. V2 другой кейс 95/21 дал added0/shortage 1; чужое 19 у обычного 84 вернуло 404. Disabled controls отдельно не выдаются за запрет подмененного grade POST.

## Продолжение desktop: R7, 02.11.2026

На реальной 51 management200 подтвердил is_competitive=false, однако результаты показывали оцененность 0/0 и безбалльное оценивание, а analytics deadlines — активное оценивание. В `b6ab5864ebc0ff577bc90b915606d1f6d4cd66fb` применимость существующего флага теперь скрывает summary/hint/status filter и evaluation deadline. Форматы/API не менялись, новый дизайн не вводился. Две регрессионные проверки упали до исправления; после 30 tests/2files, lint/format и стандартный prod build прошли. Реальный retest51 подтвердил отсутствие неприменимых текстов/контролов, с сохранением case filter и правильного noncompetitive empty state. Записей 50/51 нет.

R2–R6 и реальные R1/assignment/version/grade conflicts описаны в README и MATRIX с точными SHA. Итог интеграции остается insufficient evidence до оставшихся сценариев; исторические утверждения об отсутствии auth/writes ниже относятся к прежнему облачному этапу.

## Историческое code review облачного этапа

Исходный head: `0a589f4cbacb100a186db05fb5044ed9a826107a`. Base: `9ef90b5824b857fe53d52c097e37b279b897d9bf`. Проверены TS-изменения и bindings затронутых flows относительно base, а не только CSS или прежний авторский отчет. Масштабный визуальный аудит не повторялся.

## Найденный дефект R1 — MAJOR, исправлен

[SolutionExpertsComponent.applyFilters](../../../projects/social_platform/src/app/ui/pages/program/management/experts/solution-experts.component.ts#L307) в `0a589f4c` всегда вызывал FormControl.setValue, даже при неизмененном значении. Подписки status/caseFilter сбрасывали выбор; status дополнительно сбрасывал страницу. В V1 [applyFilters](../../../projects/social_platform/src/app/ui/pages/program/management/experts/experts.component.ts#L564) уже проверяет изменение значения.

Воспроизведение: выбрать одно из двух решений одного кейса → открыть фильтры → применить тот же кейс. Выбор исчезает. Следующий [startAllocation](../../../projects/social_platform/src/app/ui/pages/program/management/experts/solution-experts.component.ts#L712) при пустом selection использует весь фильтр. Это может расширить область следующего preview; подтверждение остается отдельным шагом, но список целей уже иной. На реальном сервере ошибочные назначения не выполнялись.

Два новых unit-сценария на исходном коде упали: выбранные эксперты 21 → 0 и выбранные solution IDs [302] → []. После минимального исправления setValue вызывается только при реальном изменении; tests проверяют сохранение страницы/выбора и preview ids=[302]. Реальное изменение фильтра по-прежнему очищает скрытый выбор. API и структура интерфейса не меняются.

Исходные результаты: `filter-regression-before.json/.log`; финальные — `review-regression-tests.json/.log` в архиве интеграционного этапа. Это доказательство уровня кода/tests, не реальный organizer E2E.

## Проверенные цепочки

| Область                        | Что прослежено                                                                                                                                                          | Вывод code review                                                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Массовый выбор экспертов       | ExpertRoster emits исходный ExpertRow; parents хранят Set ID. V1 selectedExpertRows и V2 bulk берут пересечение с filtered. Checkbox/link/menu не дают двойного toggle. | Отбор выполняется по expert ID и invitation ID, userId не подставляется. Выбор всех относится ко всему фильтру; 20 строк ограничивают только отображение.                                        |
| Фильтрация                     | Отмена modal, draft/apply/reset, реальные изменения status/case/search, page reset. V1 сохраняет существующие project/expert/case фильтры.                              | R1 исправлен. Состояния draft и примененного фильтра разделены; API поиска заявок и query/debounce не менялись.                                                                                  |
| Массовые операции              | EvaluationUseCase → EvaluationHttpAdapter → experts/bulk. Проверены mixed joined/pending, revision, expertIds, invitationIds и case scope.                              | Повтор/отзыв смешанного выбора блокируется. Добавлен тест точного payload для массового изменения кейсов. Server-side проверка атомарности без organizer сессии остается открытой.               |
| Распределение V1               | Прежние selectedProjects, single replace / bulk add, revision, saved-score protection и shortage.                                                                       | Обработчики не переписаны. Общий roster не участвует в вычислении Project assignments.                                                                                                           |
| Распределение V2               | distributionSelection → request.ids → SolutionAllocation.preview → solutionIds/revision → отдельный apply по planToken.                                                 | Project IDs не вводятся. Shortage блокирует confirm; выбор нового эксперта сбрасывает старый preview. Обработчики preview/apply и серверные ограничения не менялись; исправлен только R1.        |
| Ручные назначения V2           | options.expertId/revision, protected/eligible/ownTeam/submitted, selectedSolutions → saveApi.                                                                           | Сохраненная оценка не снимается через UI; refresh после отказа перечитывает revision, сохраняет валидный выбор и не запускает apply сам. Нужна проверка сервера в гонке.                         |
| Выгрузка экспертов             | Parents передают filtered, не visible/selected; exportExperts сохраняет числовые/null значения.                                                                         | Состав выгрузки не ограничен страницей/чекбоксами. V2 использует Solution counters. Подробные подписи статусов заменили более общие подписи как представление. Добавлен unit-сценарий 21 строки. |
| Выгрузки результатов/аналитики | Неизмененные adapters/use-cases, case/field/search filters, cancellation, отсутствие limit/offset в export.                                                             | Новых handler/payload изменений нет. Unit-тест сохраняет фильтры; реальные файлы и серверная полнота требуют live приемки.                                                                       |
| Аналитика                      | Общая progress-сводка получает только счетчики/события. V1 fetch прежний, V2 Solution analytics/assignments/scores.                                                     | Проценты округляются вниз как раньше; pending/completed, 0/false/comment сохраняются. Assignment response по C00 содержит полный массив results, а не новый client-side Project pager.           |
| Настройки / заявки             | Binding форм и dialogs → прежние handlers, Solution versions/snapshots, Project links, ProgramUpdated.                                                                  | API/model/route/guard файлы PR не менял. Наличие неизмененного handler не доказывает серверную сохранность без round trip.                                                                       |
| Права и scope                  | Busy/disabled, выбор ID, прямые routes и API; сверены unchanged adapters/domain/guards с base.                                                                          | UI не подменяет server-side permissions. Анонимные реальные GET отклонены 401; organizer/expert/participant и foreign-object authorization не проверены.                                         |

Иных конкретно воспроизведенных actionable findings в изменениях PR не найдено. Это ограниченный результат review: нельзя утверждать отсутствие серверных проблем или полную неизменность поведения по одним unit-тестам. Локальный checkout API не содержит весь актуальный Solution-management контур deployed dev; его старые Application/Submission-модели не использованы вместо C00 и реального dev. Backend не изменялся.

## Verification и ограничения

- Checked by source: перечисленные цепочки, base/head diff, handlers, ID, payload, cancellation и revision. Новая product-правка — только guard неизмененного фильтра V2.
- Checked by tests: 75 passed в шести релевантных файлах, включая четыре добавленных сценария. V1 41, V2 14, allocation 4, export 2, progress 9, Solution analytics 5. Это unit-тесты с doubles, не интеграция dev. Полный 3089-набор предыдущего этапа повторно не запускался.
- Checked by build: обычный `NG_BUILD_MAX_WORKERS=2 npm run build:prod`, exit 0 после R1; budgets/config не менялись. Адресные ESLint/Prettier и Solution type contract проверяются отдельно в results.json.
- Checked in browser with real dev: изолированный точный baseline, обычная login-форма, публичные Project/Solution GET, anonymous denial и redirect. Нет cookie injection, подмен ответов API, записи credentials, HAR или storageState.
- Not checked: все authenticated organizer/expert/participant writes и отрицательные сценарии от этих ролей; реальное сохранение, назначение/снятие, оценивание/пересчет, экспорт содержимого, ревизионные гонки и почтовый транспорт. Причина — нет авторизованной сессии; предусмотрен MANUAL.md.

Вердикт code review после R1: исправление проверено локально; полноценная интеграционная приемка и готовность к merge — **insufficient evidence**. Полный runtime verdict — README и MATRIX.csv, без замены NOT TESTED на PASS.
