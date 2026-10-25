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

ENT04, найдено при review входов: верхний participant CTA должен открывать уже существующее решение после срока подачи. Для явного solution подпись «мое решение», действие всегда разрешает прочитать C00 context (кроме pending); currentApplication/canCreate определяет сервер. Старый Project submitted/deadline disable сохраняется только в legacy. Смешанный/противоречивый legacy current_application не должен обходить C00 выбор. Просмотр не дает права редактировать или сдавать. До проверки этого случая ENT04 не считается завершенным.

ENT04 реализован и PASS: 38 targeted tests сервиса/виджета (включая открытие после срока со stale legacy reference и запрет создания), actual Angular/Django/PostgreSQL/JWT КЧ и хакатона при временно закрытых реальных локальных дедлайнах. В КЧ принятому участнику, в хакатоне капитану открывается неизменяемое сданное решение; новый зарегистрированный пользователь без заявки получает отказ на странице программы, POST создания отсутствует. 320/390/768/1440 без overflow/JS errors. Дедлайны и временно снятая локальная роль менеджера капитана хакатона восстановлены в finally; принятый состав/snapshot не менялись. Обычные dev URLs восстановлены. Evidence: participant-entry-browser-evidence.json. Предварительные helper failures были пропущенным приветствием, неправильным предположением об актере хакатона и role=dialog у старого unlabelled modal; исправлены fixture/селекторы, итоговый прогон PASS. Приветствие нового формата теперь описывает «мое решение» и доступ после срока; старый текст остается в legacy ветке. Заголовок ошибки относится к открытию решения, лишняя точка убрана. Это не миграция общего Modal или полный a11y аудит.

Итог после ENT04: npm run test:ci — 2603 tests / 472 файла и strict C00 types PASS; повторный обычный Angular development build после review PASS. Измененные TS проходят ESLint (0 errors), финальные TS/HTML/MD проходят locked Prettier, git diff --check PASS. Source review: роли, actual context и old Project путь сохранены, новых blocking findings нет. Контракт не расширялся дополнительно: используется существующий C00 context. Это не финальная готовность всей FE07/FE08 или feature.

## WID01–WID08: данные решения в существующем ролевом виджете

До реализации зафиксированы AC в backend docs/product/program-solutions-be09.md и C00 1.7.0. Сохранены геометрия, порядок, controls, shared компоненты и SCSS существующего виджета. Изменены источник данных, подписи и реальные ссылки. Новый composed screen не добавляется; это не административный дизайн D02.

ProgramRoleWidget теперь использует сгенерированный C00 union. Ветка solution получает SolutionRef, проекты сохраняют id/programLinkId. Presentation не превращает решение в Project: участник открывает /solutions/:solutionId, эксперт — solutions-rating, организатор видит solutions/уникальных людей без команды. Noncompetitive submitted и личные неприменимые counts остаются null, 0 не теряется. Приоритет завершенности и локальные часы/cleanup прежние; дополнительных HTTP или polling нет. 409 показывает «Данные заявки требуют проверки», без сырого DRF body; автоматическое создание отсутствует.

- Checked by source: template и TS различают storageMode, currentApplication Project DTO не используется. Legacy queryParams сохранены, права остаются на backend. C00: прежние 74 schemas / 34 operations / 59 scenarios не изменены; 1.7.0 содержит 85 / 35 / 72, обе копии byte-identical.
- Checked by tests: 21 component + 8 real HTTP adapter/CamelcaseInterceptor tests PASS; старые helper/state tests проходят. Новый strict type test отклоняет projectId и participantProject в solution ветке. Полный npm run test:ci — 2615 tests / 473 files и strict C00 types PASS.
- Checked by build: обычный npm run build:social:dev PASS после local QA и восстановления dev URLs; scoped ESLint 0 errors. Locked Prettier 3.8.3 проверил 1961 LF-normalized файлов без нарушений; git diff --check PASS. SCSS не менялся.
- Checked in browser: настоящий Angular/Django/PostgreSQL/JWT трех ролей КЧ/хакатона/noncompetitive, свои ссылки, empty/case-not-selected, 0/null/completed, Mont, размеры 320/390/768/1440 без overflow. Controlled network/retry и 409 без raw detail, legacy эксперт и маршрут проектов PASS; 0 solution writes и JS errors. Скриншоты widget-\*.png и widget-browser-evidence.json находятся в design-artifacts/program-solutions-20261024/expert-v1/implementation. Первый прогон имел timeout на белой странице; повтор с диагностикой HTTP/status/JS прошел полностью, причина первого сбоя не подтверждена. Временная локальная роль менеджера восстановлена.
- Not checked: содержание основной manager analytics, новые administrative layouts, публикация и полный a11y audit; их готовность из успешного виджета не следует.

Requirement audit WID08 PASS вместе с API WID01–WID07. Review: виджет сохраняет иерархию и плотность, одно основное действие, прежнюю группировку и tab order; отсутствуют локальные дубликаты controls или новые декоративные блоки. Длинное имя остается ellipsis с полным tooltip, роль/метрики не смешиваются с состояниями error/empty. Изменения адаптируют данные существующего согласованного UI. Blocking findings блока не обнаружены; вся FE07/FE08 и общий первый выпуск еще не готовы.

## QA01: настоящий criteria refresh и отказ экспертной роли

Проверены распределенное оценивание КЧ и открытое хакатона: actual manager PUT во время ввода → POST409/criteria_changed → GET/rebase с 0/False по ID/типу и копией старых 1000 → новый required/focus → один подтвержденный POST с 0/False/0/1000 → собственные счетчики и возврат q/case/status. После закрытия срока в подтверждении сохраненный 0 остается, локальная 2 доступна для копирования. Второй эксперт получает только null собственных значений, капитану экспертный frame закрыт.

Найден реальный пропущенный код not_program_expert после отзыва экспертной роли при сохраненной роли организатора: POST403 оставлял старую форму. Код добавлен в существующее очищение frame/form/previous. Права, C00, layout и controls сохранены; один параметризованный regression был красным, после fix 9 component и final test:ci 2794/479 + strict types, development build/scoped lint PASS. [Before/after, 16 checkpoints, 52 C00 responses/11 requests, domain verifier и точная история частичных запусков](../qa/program-solutions-expert-revision-20261025/README.md). Ранний dynamic chunk error при HTTP200 сохранен, его причина не установлена; финальный actor check отдельно прошел без JS errors. Общая FE07/QA01/REL01 не объявляется завершенной.
