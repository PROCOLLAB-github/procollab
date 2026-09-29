> **Архив design-этапа. Дизайн согласован 29.09.2026.** PROPOSED разрешены для вакансий без глобального утверждения. Упоминания «ожидается», «пока только в Figma», «баг не исправлен» ниже описывают состояние до approval. Актуальные изменения Angular и проверки: [отчёт реализации](../implementation-review.md) и [README](../README.md).

# Вакансии — дизайн на проверку

Статус: **DESIGN APPROVAL REQUIRED**. 29.09.2026. Ветка **feat/dev-vacancy-interface-redesign** сохранена. В этом этапе Angular-исходники не менялись; PR не открыт. Текущая галерея остаётся исходным кандидатом, а не доказательством соответствия Figma или стабильности поиска навыков.

[Открыть Feature Design / Vacancies в том же Figma-файле](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=51-1751).
[Предлагаемые расширения UI KIT](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=51-1752).

## Результат и проверка доступа

Чтение и запись в PROCOLLAB Design System v1 доступны. Проверена сама страница **UI KIT (0:1)**: локальные Button, Badge, Status, Card, Modal, Patterns и переменные существуют. Подключённой опубликованной библиотеки PROCOLLAB поиск не показал; этот результат не использовался как доказательство отсутствия локальных компонентов.

Создан отдельный section **51:1751**, внутри UI KIT, справа от существующих feature sections. В нём 12 редактируемых экранов: desktop 1440 и mobile 390 для каждой из шести областей. Добавлена доска пустых/граничных состояний и выбора навыков **58:3086**. Существующие мастера и глобальные токены не менялись. Расширения и 17 переиспользуемых feature-композиций лежат отдельно, со статусом **PROPOSED** и объяснением связи с Angular.

Проверка структуры: **358 INSTANCE**, **1169 слоёв с boundVariables**, 8 экземпляров существующего Pattern / PageHeader, 17 Button / Primary, 28 Button / Outline, 37 экземпляров предложенного Card content. Список mainComponent id и пример каждого экземпляра: [verification.json](verification.json). Это реальные Figma instances; тексты, auto-layout, свойства и content slots редактируются. Картинкой является только аватар из локального fixture. Временный HTML capture **50:1751** удалён после переноса reference-изображения аватара.

## Ссылки на экраны

| Область | Desktop + mobile | Экспорт для отчёта |
|---|---|---|
| Вакансии проекта | [01](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=56-2144) | [PNG](01-project.png) |
| Общий список вакансий | [02](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=56-2468) | [PNG](02-catalog.png) |
| Страница вакансии | [03](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=56-2964) | [PNG](03-detail.png) |
| После создания | [04](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=56-3182) | [PNG](04-created.png) |
| Просмотр откликов | [05](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=56-3246) | [PNG](05-responses.png) |
| Мои отклики | [06](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=56-3771) | [PNG](06-my.png) |
| Пустые данные, длинные строки, навыки | [07](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=58-3086) | [PNG](07-states.png) |

PNG — вспомогательные экспорты. Основной результат — редактируемые экраны по Figma-ссылкам.

## Аудит кандидата до изменений

В рабочем diff уже были 49 изменённых tracked-исходников и 11 новых исходников. Проверены README, галерея, shared SCSS, domain widgets, Button/Modal/Tag/Avatar и форма навыков. Существующие изменения сохранены.

| Область | Уже есть в Angular | Фактически использовано в кандидате |
|---|---|---|
| Вакансии проекта | VacancyCardComponent, ProjectVacancyStepComponent, ButtonComponent | Новый VacancyStatusComponent; VacancySkillsComponent поверх TagComponent; shared surface/actions mixins; role, isActive, requiredSkills; прежнее подтверждение удаления |
| Каталог | ProjectVacancyCardComponent, AvatarComponent, ButtonComponent, поиск/фильтры | VacancyStatus/Skills; role как главный заголовок; проект отдельно; условный CTA по существующим правам |
| Страница | VacanciesDetailComponent, VacancyInfoComponent, VacanciesLeftSideComponent, VacanciesRightSideComponent | Те же shared surface/actions, статус и навыки; условия и контекстные действия |
| После создания | ModalComponent, ButtonComponent, ProjectVacancyService | Новый VacancyCreatedDialogComponent; окно только после успеха; guard повторной отправки; Router на созданную вакансию |
| Просмотр откликов | VacancyResponsesComponent, AvatarComponent, ModalComponent, ButtonComponent | VacancyStatus/Skills/Letter; подтверждённый сервером статус; действия только pending |
| Мои отклики | VacanciesListComponent, ResponseCardComponent | VacancyStatusComponent и VacancyLetterComponent; объединённая карточка, письмо/файл, empty state |

**Generic Angular CardComponent и StatusComponent, эквивалентных всему Figma-каталогу, в этом flow нет.** Поверхности реализованы доменными шаблонами и mixin surface; VacancyStatus — новый доменный адаптер. Не следует выдавать эти композиции за готовые универсальные runtime Card/Status.

Code Connect файлов для этих компонентов не найдено. Сопоставление выполнено по реальным Angular-исходникам и локальным DS contracts, а не по несуществующей автоматической интеграции.

### Уже существующие локальные Figma-компоненты

| Семейство | Реальные узлы и варианты | Вывод |
|---|---|---|
| Button | Set 5:361; Primary 5:233, Outline 5:265, Neutral 5:297, Destructive 5:329; Default/Hover/Pressed/Focus/Disabled/Loading | Основной CTA не требует нового цвета или нового Primary |
| Badge | Set 5:142; Category 5:133, Count 5:135, Removable 5:137 | Есть базовые badges; нет адаптации длинного навыка кандидата с wrap/min-height 28 |
| Status | Set 5:193, D03 proposed mapping: project.draft, evaluation.pending/completed, program.active, request.failed, invitation.pending | Семейство есть. Нет именно vacancy.active/closed и response.pending/accepted/rejected |
| Card | Set 9:498; Project 9:446, Member 9:457, Feed 9:470, Summary 9:484 | База есть. Feed содержит фиксированные поля; generic content slot и vacancy-анатомии отсутствуют |
| Modal | Set 8:561; Standard 8:408, Wide 8:515, Confirmation 8:538; Focus/Loading/Error у Standard | Есть основа, но Wide содержит текстовое поле, а Confirmation — горизонтальные actions |
| Patterns | PageHeader 11:289, ListPage 11:311, DetailPage 11:450, FormPage 11:506 | PageHeader использован настоящими instances; List/Detail/Form — контракты композиции. Полные шаблонные экземпляры с чужими доменными полями не вставлялись |
| Сопутствующие | Avatar 5:94; Search 6:873; Select 6:529; Checkbox 6:651; EmptyState 9:407; IconButton 5:489 | Переиспользованы в экранах и доске состояний |

### Источник нового CTA

В **projects/social_platform/src/styles/components/_vacancy-ui.scss:62** правило .button.button--inline задаёт background: var(--accent-dark). Это локальное переопределение добавлено в предыдущем redesign-кандидате при работе над контрастом.

Канонический Button и **styles/_colors.scss:9** используют --accent: **#8A63E6**. --accent-dark вычисляется Sass color.adjust и в кандидатском CSS даёт около **#7B63B3**. Это другой токен; его существование не разрешает подменять Primary. Дополнительно .button--green был затемнён до --green-dark, а outline/secondary/pending использовали собственные color-mix.

В Figma основной CTA теперь — instance существующего **Primary 5:233 → VariableID:2:41 color/action/primary → purple/500 #8A63E6**. Глобальный Primary не менялся. Принятие отклика тоже предложено единым Primary; переход статуса остаётся серверным. Реальный Angular override будет исправляться только после design approval.

## Таблица соответствия

Обозначение **P** означает «предлагаемое расширение, ещё не утверждено». Имена токенов ниже — существующие переменные UI KIT.

| Экран / элемент | Figma-компонент и вариант | Токен | Angular-компонент | Отклонение / статус |
|---|---|---|---|---|
| Заголовки 4 основных страниц | Pattern / PageHeader 11:289, Show action=false | text/primary; Heading/Large preview; space/24 | Заголовки ProjectVacancyStep, Vacancies, VacanciesDetail, VacanciesList | В Angular нет отдельного PageHeader primitive. Figma typography preview отличается метриками от Mont |
| Проект / карточка | Card / Vacancy content **P 53:1751**, производное Feed 9:470 | background/primary, border/default, radius/medium, space/20 | VacancyCardComponent; surface mixin | Content slot, radius 8 вместо radius 15 базового Feed — явное расширение под кандидат |
| Проект / статус | Status **P 53:1806**, vacancy.active / vacancy.closed | successSurface, success, green/700; background/subtle, border/strong | VacancyStatusComponent | Новые доменные ключи; семантика active/closed сохранена |
| Проект / действия | Button / Outline 5:265; Destructive outline **P 53:1807** | action/primary; status/error; text/primary; focus/ring | ButtonComponent: outline; color=red | Primary/outline цвет возвращён контракту. Destructive outline оформлен отдельно; подтверждение удаления сохраняется |
| Все / навыки | Badge / Vacancy skill **P 53:1790**, Hard / Soft / Removable | successSurface, green/700; action/secondary, text/primary; radius/pill | TagComponent + VacancySkillsComponent; SkillsBasketComponent | Wrap, 13px, min-height 28. Цвет Soft и промежуток 8px вместо color-mix/6px кандидата — предложение на review |
| Все / раскрытие навыков | Badge / Soft **P**, подпись «Ещё +N»; Button / Outline «Свернуть» | action/secondary; text/primary; action/primary | VacancySkillsComponent toggle | В текущей галерее toggle прозрачный outline; здесь lavender fill и полная подпись. Нужна проверка данного отклонения |
| Каталог / карточка | Vacancy pattern / Catalog **P 55:1893 и состояния** → Card content | background/primary, border/default, text/primary, space/16 | ProjectVacancyCardComponent | Переиспользуемая feature-композиция, не новый global Card contract |
| Каталог / CTA | Button / Primary 5:233 и Outline 5:265 | action/primary **#8A63E6**, text/onAction | ButtonComponent | Галерея использует --accent-dark; исправление пока только в Figma |
| Каталог / поиск и фильтры | Search / Toolbar 6:825; Checkbox 6:568; Button / Primary | background/secondary, border/default, action/primary | SearchComponent, существующий UI фильтров | Mobile filter trigger показан компактно; полный runtime flow не перерабатывался |
| Detail / header и описание | Detail-композиции **P 55:2373, 55:2403** → Card content + Avatar 5:85 | text/primary, action/link, background/primary | VacancyInfoComponent, VacanciesLeftSideComponent | Полный заголовок; placeholder-превью аватара из fixture |
| Detail / условия и действие | Detail / conditions **P 55:2446** + Button / Primary | text/secondary, action/link, action/primary | VacanciesRightSideComponent | На mobile блок идёт после описания; права на respond/manage не меняются |
| Успех / модалка | Modal / Vacancy created **P 62:3224**, производное Confirmation 8:538; вложенные Primary/Outline | background/secondary, radius/large, space/24, action/primary | VacancyCreatedDialogComponent + ModalComponent | Новый вариант только для вертикальных CTA. Существующий Confirmation остался горизонтальным |
| Успех / поведение | Перейти к вакансиям / Остаться в проекте | Существующие Button состояния | AppRoutes.office.vacancy(id), closed.emit | Окно только после успеха; первичный переход на созданную вакансию сохранён. Figma не выполняет Router/API |
| Отклики / модалка | Modal / Vacancy responses **P 53:1763**, производное Wide 8:515 | background/secondary, radius/large, space/24; mobile space/16 | ModalComponent + VacancyResponsesComponent | Slot вместо одного текстового Content. Для ревью контент показан целиком; runtime max-height/scroll сохраняются |
| Отклики / карточка кандидата | Response-композиции **P 55:2105, 55:2178, 55:2235** + Avatar | background/primary, border/default, action/link | VacancyResponsesComponent, VacancyLetterComponent, AvatarComponent | Письмо/файл редактируемые; отсутствующие данные показаны отдельным состоянием |
| Отклики / статус | Status **P**, response.pending / accepted / rejected | action/secondary; successSurface; errorSurface; text/primary | VacancyStatusComponent | Pending текст из color-mix переведён на text/primary; принято/отклонено — после успеха API |
| Отклики / решения | Primary 5:233 «Принять», Destructive outline **P** «Отклонить» | action/primary; status/error | ButtonComponent; Accept/RejectResponseUseCase | «Принять» предложено purple вместо green-dark галереи; только pending имеет действия |
| Мои отклики / единая карточка | My response-композиции **P 55:2294, 55:2319, 55:2342** → Card + Status | background/primary, border/default, status surfaces, action/link | ResponseCardComponent + VacancyLetterComponent | «На рассмотрении» — тот же pending для кандидата; письмо/файл внутри одной карточки |
| Мои отклики / пусто | EmptyState / No data 9:365 + Primary | text/primary, text/secondary, action/primary | VacanciesListComponent empty template | В Angular нет отдельного generic EmptyState; повторно использовать существующий шаблон/минимальный адаптер |
| Каталог / нет результатов | EmptyState / No results 9:375 + Outline | text/primary, text/secondary, action/primary | Каталог вакансий / фильтры | Дизайн состояния; соответствие реальным backend-ответам ещё не проверено |
| Форма / поиск навыков | Select / Searchable adapter 6:456, Loading 6:507 | border/default, action/primary, text/secondary | **AutocompleteInputComponent**, SearchesService; не простой SelectComponent | Figma adapter представляет autocomplete; Angular primitive заменять на select не требуется |
| Форма / выбранные и библиотека | Badge / Removable **P 53:1784**, Checkbox Checked 6:589 / Unchecked 6:568, Search / Toolbar | action/secondary, action/primary, text/primary | SkillsBasketComponent, SkillsGroupComponent, AutocompleteInputComponent | Общие выбранные id, удаление и сохранение — контракт для проверки; баг пока не исправлен |

## Что изменено относительно текущей галереи

1. Основные CTA возвращены с #7B63B3 на **#8A63E6**. «Принять» также предложено как существующий Primary вместо локального green-dark. Цвет outline — из Button contract.
2. Непривязанные смешанные secondary/pending/soft цвета заменены существующими semantic tokens в Figma. Нейтральный текст опасного outline и розовая граница оформлены предложением.
3. Поверхности, статус и навыки оформлены как instances предложенных расширений; указана связь с существующими Card/Feed, Badge, Status и Modal. Семантическая иерархия кандидата сохранена: роль → проект → условия → навыки/описание → действия.
4. Длинные навыки переносятся. В Figma расстояние между chips 8px, тогда как в кандидатском SCSS 6px. Toggle «Ещё +N» залит lavender; в галерее он outline. Это видимые предложения на согласование, не незаметно применённые runtime-изменения.
5. Mobile действия идут полной шириной колонкой, статус — под длинным заголовком. На desktop карточки в одной строке выровнены по высоте. Сетка остаётся 2 колонки / 1 колонка. Размеры межблочных интервалов приведены к существующим Figma spacing variables.
6. Figma использует существующие TEMP Inter text styles, поскольку Mont отсутствует среди доступных коннектору шрифтов. Mont остаётся каноническим runtime-шрифтом. Масса и метрики текста в preview не должны автоматически переноситься в Angular.
7. Оболочка — лёгкое reference-обрамление локального preview. Затемнение модалок показано на нейтральном фоне; полная оболочка кабинета и фон проекта не перерабатывались. Длинное окно откликов показано целиком для ревью; в реализации нужен ограниченный viewport и scroll.

## Предлагаемые расширения UI KIT

| Предложение | Почему существующего варианта недостаточно | Связь с Angular |
|---|---|---|
| Card / Vacancy content 53:1751 | Feed имеет фиксированные Source/Title/Description/Badge/Button; нужны разные композиции с редактируемым content slot и radius 8 кандидата | Shared surface + VacancyCard / ProjectVacancyCard / ResponseCard / detail |
| Modal / Vacancy responses 53:1763 | Wide содержит одно текстовое поле, нужен список карточек откликов | Modal + VacancyResponses |
| Modal / Vacancy created 62:3224 | Confirmation содержит горизонтальные actions; вертикальное направление не сохранялось как instance-only override через connector | Существующая вертикальная композиция VacancyCreatedDialog |
| Badge / Vacancy skill 53:1790 | Category/Removable не задают перенос длинного названия и адаптивную высоту кандидата | Tag + VacancySkills / SkillsBasket |
| Status / Vacancy domain mapping 53:1806 | Нет конкретных ключей вакансий и откликов; D03 остаётся proposed | VacancyStatus; существующие isActive/responseStatus |
| Button / Destructive outline 53:1807 | Нужна вторичная опасная outline-кнопка из текущего Angular-кандидата | app-button appearance=outline color=red |
| 17 Vacancy pattern-композиций | Переиспользование anatomy и состояний между desktop/mobile без detach | Доменные widgets, не новый универсальный Angular-компонент |

Новых global colors/spacing/text styles не создано; D01–D05 не мигрированы. Primary, Outline, Avatar, Search, Checkbox, EmptyState, IconButton и PageHeader продолжают ссылаться на исходные local masters.

## States, responsive и accessibility

| Состояние / поведение | Где показано / зафиксировано | Что ещё проверять в реализации |
|---|---|---|
| Desktop 1440 / mobile 390 | Все 6 пар | Mont metrics; 768 и 320 после последней правки Angular |
| Длинный русский заголовок | Проект, каталог, detail, my | Полный title на detail; clamp только превью |
| Строка без пробелов | Доска 07 mobile | overflow-wrap:anywhere без горизонтального scroll |
| 0 / 1 / 11 навыков | Проект, карточки, доска 07 | Точный hidden count; раскрытие/сворачивание |
| Нет описания/условий/письма/файла | QA, accepted response, доска 07 | Отсутствующее значение отдельно от валидного нуля |
| Нет откликов / нет результатов | EmptyState instances на доске 07 | Реальная ветка UI по API |
| Pending / accepted / rejected | Отклики и «Мои отклики» | Повторное чтение с сервера после решения |
| Success | Модалка 04 | Только после успешного create; обе кнопки и close |
| Поиск / loading / no-results / выбранные | Доска 07 | Гонки запросов, синхронизация библиотеки, delete/edit/save/reopen |
| Focus / Escape / return focus | Аннотация поведения; существующий Button/Modal contract | Новый браузерный прогон после реализации |
| Ошибка сохранения / disabled submit | Текстовый контракт на доске 07; прежний Angular-кандидат | Сохранность полей; retry; двойная отправка |

Контраст **#FAFAFA / #8A63E6 ≈ 4,02:1**, по формуле относительной яркости sRGB. Это ниже 4,5:1 для обычного мелкого текста. Канонический Primary сохранён по запросу пользователя; это известный вопрос D02, а не основание незаметно затемнять CTA. AA всего нового дизайна не заявляется. Прежний минимум 4,67:1 относится только к предыдущему Angular-кандидату с другим CTA.

## Результат ограниченного Design QA

- Operate: знакомые подписанные действия, различимый статус, сохранение прав и server lifecycle, один основной CTA в контексте. Полные тексты на detail; expandable letter/skills.
- Layout: все 12 экранов визуально просмотрены. Исправлены обрезания заголовков и второй кнопки mobile после смены оси auto-layout; исправлена ширина коротких статусов; Confirmation оформлен отдельным вариантом; короткие навыки не переносятся посередине слова.
- Структурная проверка после правок не нашла дочерних элементов за границами frames с включённым clipping. Это проверка макета, не браузерный тест.
- Приоритеты critique: (1) отклонение CTA от контракта — исправлено в Figma; (2) отсутствие доказуемой компонентной структуры — исправлено instances/variables/ledger; (3) mobile clipping — исправлено; (4) нестабильность skills — оставлено этапу 4; (5) Mont и контраст D02 — явные ограничения.
- Сохранены белые карточки, лёгкие границы, purple/green семантика, pill-кнопки, структура и сценарии кандидата. Монолитный глобальный DS не перерабатывался.

## Навыки: только source inspection, исправление не заявлено

В **SearchesService** (providedIn: root) **inlineSkills** — общий signal. Метод **onSearchSkill** создаёт отдельный subscribe на каждый запрос и записывает каждый ответ в этот signal. В нём нет отмены предыдущего запроса или проверки актуальности ответа. **ProjectsEditInfoService** напрямую разделяет этот signal и делегирует поиск.

Это подтверждённое свойство кода и обоснованный кандидат причины гонки. Пользовательский сбой ещё не воспроизведён с контролируемым порядком ответов; это не доказанный единственный root cause. Отдельно проверить локальные изменения формы, SkillsBasket и библиотеку.

Предыдущий preview в **docs/vacancy-redesign/preview/main.ts:301** подменяет inlineSkills на signal([]). Поэтому 534 старые browser assertions не доказывают стабильность реального выбора навыков.

После явного approval:

1. Воспроизвести быстрый ввод и смену запроса; задержать ответы и поменять порядок их прихода; проверить очистку запроса и изоляцию соседних потребителей root-сервиса.
2. Проверить выбор из подсказки и библиотеки, повторный выбор, удаление, синхронизацию id и отсутствие дублей.
3. Открыть существующую вакансию; изменить навыки; сохранить; повторно открыть и сравнить id/labels с ответом API.
4. Исправить подтверждённый источник рассинхронизации; добавить целевые meaningful tests на порядок ответов и lifecycle формы.
5. Сверить Angular с утверждёнными Figma-экранами, включая CTA. Повторить tests/build/browser после последних изменений.
6. Разделить отчёт на локальные fixtures и рабочий DEV API. Подготовить draft PR в dev; merge/deploy не выполнять.

## Статус проверок и разрешений

| Категория | Статус |
|---|---|
| Figma access / write / local UI KIT inventory | Проверено успешно |
| Figma screenshots и structural bindings | Выполнено в этом этапе |
| Source audit текущей ветки / shared skills signal | Выполнено, исходники не изменены |
| Angular tests/build/browser | Не перезапускались в design-этапе. Ранее: 401 файл / 1949 тестов, build success, 534 browser assertions / 48 состояний |
| Рабочий DEV API: навыки, save/reopen | **Не проверено** |
| Root cause и исправление навыков | **Не завершено** |
| Полное соответствие Angular новому Figma | **Ещё не проверено** |
| Design approval пользователя | **Ожидается** |
| Draft PR / merge / deploy | **Не выполнялись** |

Пауза задана пользователем на этапе 3 и skill **procollab-design-screen**: «Дождись явного approval пользователя; наличие Figma-ссылки или утверждённой spec его не заменяет». Конкретный дизайн готов для ревью; текущая ветка не объявляется завершённой.

## Артефакты

- [state.json](state.json) — логическое состояние и node ids.
- [verification.json](verification.json) — экземпляры, токены, исходные Primary/Confirmation, результат проверки clipping.
- common.js, proposals.js, domains.js, screens.js, states.js, layout-fixes.js, success-variant.js — журнал использованных Figma-сценариев. Они создают объекты и **не предназначены для слепого повторного запуска**; продолжать следует по сохранённым node ids.
- review-*.png — первый проход QA, содержит выявленные дефекты; финальные экспорты имеют названия 01-project.png … 07-states.png.
