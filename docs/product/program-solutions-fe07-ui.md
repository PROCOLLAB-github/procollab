<!-- @format -->

# FE07: экспертная оценка решения

Первый UI-блок FE07 реализован и проверен в локальном браузере; общий выпуск еще не завершен.

## Источник и согласование

25.10.2026 пользователь явно согласовал D01 и уточнил ожидание последних правок из чата «go to UI». Проверка показала: ранний локальный D01 опирался на прежний Angular-код, поэтому актуальным источником выбраны уже согласованные и слитые frontend #506 (15905184) и API #823 (c68a004e). Их origin/dev интегрирован в рабочие ветки. Подробности: `design-artifacts/program-solutions-20261024/expert-v1/design-handoff.md` и `design-artifacts/project-scoring-form-20261024/implementation/review.md` в workspace.

Используется существующий `ProjectRatingComponent` как чистый renderer числовых/булевых/текстовых критериев. Его вход сужен до данных поля без обязательного expertId: никакого вымышленного Project или ID эксперта для рендера решения нет. Структурная совместимость прежнего ProjectRatingCriterion сохранена. Общие native Button/Field/Modal, Mont и стили текущего сценария оценивания переиспользованы.

## Поведение и контракт

Список `/office/program/:programId/solutions-rating` использует реальные SolutionRef; собственные pending/completed приходят с сервера после поиска/кейса и до статуса/пагинации. Query сохраняет q/case/status/page; возврат из оценки восстанавливает URL и положение. Пагинация использует явные limit/offset C00 и query page, как общий кабинет. Фильтр кейса открывается в существующей модалке; отмена не применяет выбор. Эксперту не нужен доступ к закрытой живой форме: только case_options из scoped списка.

Форма `/office/program/:programId/solutions/:solutionId/evaluation` читает сданный snapshot и собственные критерии. Вкладки «Решение» / «Команда» сохраняют ввод; ожидающие приглашения не становятся составом. Сервер управляет canRate и blockedReason. Критерии валидируются общей формой; 0 и false не пустые. До POST открывается подтверждение всех значений; pending блокирует повтор/закрытие/выход. После успеха показывается сохраненная оценка, доступное изменение определяется сервером. Ошибка оставляет ввод; смена критериев требует GET новой ревизии и сохраняет совместимые значения по ID/типу. Не совпавшие поля доступны для копирования. Потеря доступа очищает закрытое содержимое.

C00 1.6.0 перед реализацией расширен до комментария 1000 символов, как текущий ProjectScore, и optional RatingPage.evaluation_counts/case_options. Старые операции/ID/ошибки не меняются; числовой диапазон, True/False и обязательность сохраняются. Backend добавляет merge migration для двух веток project_rates.0008 и расширяет SolutionScore.value.

## Критерии приемки этого блока

| ID   | Проверяемое поведение                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| UI01 | Список использует настоящие solutionId, серверные собственные счетчики и query-фильтры/пагинацию                               |
| UI02 | Сданные материалы и принятый состав видны по конкретной заявке; переход на вторую вкладку не теряет оценку                     |
| UI03 | Общие controls требуют числовые и булевы ответы, принимают 0/false и необязательный комментарий до 1000                        |
| UI04 | Подтверждение показывает все ответы; pending дает один POST и не позволяет закрыть/уйти                                        |
| UI05 | Saved/edit/closed состояния соответствуют серверу, показываются только собственные значения                                    |
| UI06 | Network/revision errors сохраняют ввод; обновление критериев сохраняет совместимые значения, устаревшие ответы не отправляются |
| UI07 | Чужая программа/заявка и потеря доступа не раскрывают данные; поздний ответ прошлого контекста игнорируется                    |
| UI08 | Возврат разрешен только в собственный список или общий кабинет; несохраненный ввод защищен stay/leave и beforeunload           |
| UI09 | Desktop/mobile, Mont, keyboard/focus, error/empty/loading/no access, отсутствие overflow и ошибок JS проверены в браузере      |
| UI10 | Существующие Project scoring, native buttons/links и маршруты сохраняют поведение                                              |

## Проверка

Backend: 181 PostgreSQL tests оценивания/результатов PASS, миграции применены локально; graph и migration consistency PASS. Angular development build, ESLint измененных файлов и Stylelint нового SCSS PASS. Полный Vitest: 2594 tests в 472 файлах PASS; strict C00 types PASS. После финального review guard отдельно 8 tests PASS; повторный build PASS. Locked Prettier 3.8.3: 1960 файлов при LF без нарушений; финально измененные файлы проверены отдельно. Source fix Button сохраняет native disabled только у button и aria-disabled/click guard у ссылок, устраняя наблюдавшийся NG0303. Отдельный тест проверяет disabled/loading и запрет перехода ссылки.

Браузер: настоящие Angular/Django/PostgreSQL/JWT, вымышленные КЧ и хакатон, сохраненная оценка → изменение → 0/False/1000 символов → вторая вкладка «Команда» → отмена/подтверждение → один POST → сохранение → список/фильтры/счетчики PASS. Pending блокирует действия и Escape. Участнику запрещен экспертный frame; на 320/390/768/1440 нет горизонтального overflow и ошибок JavaScript. Дополнительные controlled HTTP сценарии UI: пустые критерии, закрытая оценка, network error с сохранением ввода, stay/leave, required/focus, Escape, criteria_changed → обновление ревизии с сохранением совместимых значений PASS. Эти подмененные HTTP состояния проверяют UI, а права/сроки проверены отдельными PostgreSQL tests. Нативное системное окно beforeunload не проверялось; HostListener и маршрутный guard проверены отдельно. Полный аудит контраста не заявляется.

Evidence: `design-artifacts/program-solutions-20261024/expert-v1/implementation/` в workspace, browser-evidence.json, ui-states-evidence.json и screenshots desktop/mobile/confirmation/list. Состав и критерии на скриншотах вымышленные. В общих элементах оболочки на fixture отсутствуют изображения; новая форма использует Mont и существующие tokens. Timing/selector ошибки первых QA-скриптов исправлены; итоговые прогоны PASS. Ошибка нового readonly URL unit test была в обновлении прежнего FormGroup без изменения OnPush input; тест исправлен на замену frame/group, как в фактическом readonly сценарии.

Requirement audit после review:

| AC   | Evidence                                                                              | Verdict                                                                        |
| ---- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| UI01 | list unit (query/cancel/counts), реальные HTTP/browser поиск/кейс/переход/возврат     | PASS в новом списке                                                            |
| UI02 | реальный snapshot/Team обеих форм, unit сохраняет renderer и значения                 | PASS                                                                           |
| UI03 | общий renderer tests, backend границы 1000/1001, browser 0/False/1000                 | PASS                                                                           |
| UI04 | unit один POST/blocked leave, browser подтверждение/отмена/pending/Escape             | PASS                                                                           |
| UI05 | source server canRate, unit saved/closed, browser saved/edit и controlled closed      | PASS                                                                           |
| UI06 | unit criteria refresh, browser controlled network и criteria_changed с сохранением    | PASS                                                                           |
| UI07 | backend permissions tests, actual HTTP участника, unit late POST/access loss          | PASS в проверенном scope                                                       |
| UI08 | unit return URL/context/beforeunload, browser stay/leave/return                       | PASS; native beforeunload dialog не проверен                                   |
| UI09 | реальные 320/390/768/1440, controlled states, focus/Escape, screenshots               | PASS в указанном browser scope; полного a11y аудита нет                        |
| UI10 | полный регрессионный suite, shared renderer/Button tests, существующие Project routes | PASS по tests/source; старый Project browser flow здесь повторно не запускался |

Блокирующих замечаний текущего scope после исправлений не осталось. На review сравнение по отображаемой подписи заменено сравнением исходных значений: буквальный комментарий «Не указано» теперь запускает защиту ухода и остается доступен для копирования при удалении критерия. Regression test проверяет guard и beforeunload. Это не приемка полного смешанного кабинета или административных экранов.

Еще осталось в FE07/FE08: подключить программные входы к нужному формату, административные интерфейсы и результаты/выгрузки, остальную аналитику и публикацию. Не объявлять всю FE07 или feature готовой по этому блоку.

## Следующий блок: общий кабинет

Current: свежий согласованный кабинет из #506 запрашивает include=projects и строит маршруты только по projectId. Target: сохранить его расположение, вкладки, приглашения, debounce, фильтры, пагинацию, own counters, возврат и account scope; данные работ брать из уже зафиксированного GET /evaluation/applications/, карточки программ/приглашения из прежнего GET /evaluation/programs/. Новый API не вводится. Роль остается прежней: авторизованный эксперт видит только свои реальные назначения.

CAB01: объединение двух ответов атомарно для текущего аккаунта/запроса, ошибка любого не выглядит пустым успехом. CAB02: kind=solution открывает /solutions/:solutionId/evaluation, kind=legacy_project сохраняет /projects-rating/:projectId; одинаковые assignment/entity IDs не конфликтуют. CAB03: прежние query, debounce, pagination и returnUrl сохранены. CAB04: счетчики только серверные, глобальные по прежнему контракту кабинета; ошибки/недоступные работы не дают ложного «все оценено». CAB05: существующий invitation deep link/accept/profile refresh сохраняется, смена аккаунта очищает приватные данные и отменяет оба запроса. CAB06: actual browser mixed cabinet → решение/Project → возврат, mobile и negative/error states; только вымышленные данные. После реализации evidence фиксируется отдельно.

Реализовано: forkJoin прежних программ/приглашений и нового Result списка работ; snapshot применяется только целиком. Ошибка C00 показывает detail/вход при 401, сбой прежнего endpoint тоже очищает snapshot. Account/query cleanup отменяет оба запроса. Group и route используют настоящий ApplicationRef, track включает kind/program/assignment. Тексты общего кабинета говорят «работы», layout/controls остаются согласованными из #506. На пустой странице за пределами count диапазон 0–0 вместо 21–3.

| AC    | Evidence                                                                                                                                          | Verdict                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| CAB01 | unit двух ответов/error/unauthorized/account cancellation; browser controlled network/program API failure + retry                                 | PASS                                                                          |
| CAB02 | unit коллизии ID; реальный browser Project.id=2 и ProgramSolution.id=2 в разных программах, обе правильные формы                                  | PASS                                                                          |
| CAB03 | прежние unit query/таб/программа/страница/cancellation, новый empty range; реальный browser фильтр → форма → точный возврат, поиск/reset и page=2 | PASS                                                                          |
| CAB04 | unit серверных counts/no access/unavailable, реальный HTTP/browser 3 completed и поиск без результатов с теми же глобальными counts               | PASS                                                                          |
| CAB05 | прежние invitation deep link/accept once/profile/error tests и новый cancel обоих источников                                                      | PASS по tests/source; actual invitation accept browser повторно не запускался |
| CAB06 | actual mixed cabinet → readonly решение/Team/Project → return, 320/390/768/1440 без overflow/JS errors; controlled errors                         | PASS в указанном scope                                                        |

Browser evidence: cabinet-browser-evidence.json, cabinet-desktop.png, cabinet-mobile.png в том же implementation каталоге. Backend данные вымышленные, внешние запросы заблокированы. Первая неуспешная попытка была ошибкой seed: программе автоматически добавляется штатный комментарий, а fixture сначала не создал его пустую оценку. Исправлен только локальный seed; итоговый browser PASS. Layout сравнен с актуальным кабинетом #506; новых компонентов и визуального redesign нет. Блокирующих замечаний текущего CAB scope после review не осталось.

Финальные checks CAB: npm run test:ci — 2600 tests в 472 файлах и strict C00 types PASS; Angular development build с актуальным кодом для локального QA PASS; environment.ts восстановлен byte-for-byte к обычному dev. ESLint измененных TS — 0 errors; выбранные TS/HTML/MD проходят locked Prettier 3.8.3, git diff --check PASS. Это дополнение не меняет C00, backend permissions или схему БД.

## Входы со страницы программы

Before/after контракт записан в backend docs/product/program-solutions-be08.md до реализации и синхронизирован в README C00: read-only solution_storage_mode существующего GET /programs/{id}/, без изменения операций решения. Оба serializer варианта передают режим, не открывая unregistered эксперту описание/links. Program.solutionStorageMode optional для совместимости; только явный solution переключает путь. Верхняя кнопка «оценка решений» и ссылка экспертного виджета используют один routing helper, старый Project путь сохраняется. Геометрия/controls прежние, новая страница или redesign не создаются.

ENT01–ENT03: проверяются API/readonly/privacy обеих ролей, оба реальных browser входа КЧ/хакатона/legacy и regression. Метрики ролевого виджета в solution mode пока читают Project и остаются незавершенной BE09; исправление маршрута не объявляется исправлением счетчиков. Actual evidence добавляется после проверки.

ENT01 PASS по 30 backend tests detail/widget/routing и actual HTTP. ENT02 PASS: 17 widget tests, в том числе явный solution/legacy и отсутствие режима; обе ссылки используют общий helper. ENT03 PASS: реальные Angular/Django/PostgreSQL/JWT КЧ=3, хакатон=4 и legacy=5, header/widget → правильный список → возврат; 320/390/768/1440 без overflow/JS errors. Закрытое описание/links незарегистрированного эксперта не возвращаются. Angular development build PASS, ESLint измененных TS — 0 errors. Evidence: program-entry-browser-evidence.json в том же implementation каталоге. Environment restored к обычному dev. Не добавлены новые визуальные компоненты или макеты; source review не обнаружил оставшихся блокирующих замечаний routing scope.

Финальная проверка ENT: полный npm run test:ci — 2601 tests в 472 файлах и strict C00 types PASS. Locked Prettier 3.8.3 — 1960 LF-normalized файлов без нарушений; финальный MD форматируется отдельно. Backend Black/Flake8, migration consistency (No changes detected), C00 74/34/59 и git diff --check PASS. Полный runtime старого Project оценивания не повторялся сверх ранее проверенного чтения/возврата CAB; публикация и метрики не включены в этот verdict.
