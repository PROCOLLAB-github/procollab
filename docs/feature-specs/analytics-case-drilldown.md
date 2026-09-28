<!-- @format -->

# Аналитика программы: детализация кейсов и выгрузка проектов

**Статус:** Specification approved for implementation, 28.09.2026. Дизайн и решения Q1–Q4 утверждены пользователем; это не отметка о завершении реализации.
**Scope:** существующий Angular / legacy Project flow, вкладка `/office/program/:programId/analytics`.
Требования пользователя обязательны; описанный ниже compatible opt-in API contract принят для v1.

**Implementation handoff:** исследовательские refs и S-ссылки ниже сохранены как исходный snapshot.
Актуальные dev bases, пути модулей, API, AC audit и результаты реализации приведены в
[итоговом review](../qa/analytics-case-drilldown-review.md). Бизнес-требования и Q1–Q4 не изменены.

## Approved design

Утверждён [Figma section 30:1518](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE/PROCOLLAB-Design-System-v1?node-id=30-1518).
Состояния: [selected case — 31:1523](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=31-1523),
[without case — 31:1643](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=31-1643),
[loading — 31:1744](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=31-1744),
[empty — 31:1798](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=31-1798),
[no search results — 31:1864](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=31-1864),
[error/retry — 31:1925](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=31-1925),
[mobile — 31:1981](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=31-1981).
Утверждённые UI-колонки: «Проект / Лидер или команда / Сдача решения / Презентация».
В выбранном case drilldown отдельная колонка «Кейс» не показывается; scoped case JSON и явная XLSX-колонка сохраняются.
Регион остаётся в API/XLSX, размер команды — дополнительной информацией колонки «Лидер или команда».
Синтетические значения макета не меняют правила count/pagination этой спецификации.

## Problem

Блок «Кейсы» показывает распределение проектов и участников, но не позволяет перейти от числа к конкретным проектам.
Менеджеру нужно открыть выбранный кейс, увидеть проекты и презентации, затем выгрузить проекты всего блока или одного кейса.
Состав списка и файла должен соответствовать агрегатам, включая группу «Без выбранного кейса».

## Research / источники и границы достоверности

Исследованы локальные source snapshots, документы и существующие assertions тестов. Live UI/API/БД не проверялись.
Frontend: checkout `procollab-design-system-v1`, HEAD `cbcb5bffbaeb13a37176411a3ebda035618a5879`.
Сравнение с локальным `origin/master` `01d59ad59578d26777625b0a32658acbf52ec6fc` не выявило изменений analytics UI/facades/domain и program adapter.
Backend: рабочий HEAD `28799c07cc2613614806ba750860f6bd38836791`; для production-направления дополнительно прочитан
локальный `origin/master` **`2fbc7225d41d59602cc1f870dc66707e2d028420`** через `git show`, без checkout/reset.
Case grouping, export builder, project filters, models и permissions совпадают между этими backend refs.
В `origin/master` NEXTGEN routes ограничены флагом; legacy `/project-analytics/` остаётся самостоятельным контуром.
Свежесть remote refs и deployed SHA не подтверждены. Перед реализацией повторить сверку с целевой веткой.

| ID  | Источник                                                                                                                                                                                                                                                                                                                                                                                                   | Что установлено                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| S01 | [analytics.component.ts](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/analytics.component.ts), [template](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/analytics.component.html)                                                                                                                                                                   | `caseRows`, отсутствие case click handler, агрегаты, общие export actions                 |
| S02 | [analytics model](../../projects/social_platform/src/app/domain/program/program-analytics.model.ts)                                                                                                                                                                                                                                                                                                        | `ProgramAnalyticsCases`, `withoutCase`, четыре счётчика, отдельная assignment-модель      |
| S03 | [analytics info service](../../projects/social_platform/src/app/api/program/facades/detail/program-analytics-info.service.ts), [routes](../../projects/social_platform/src/app/ui/routes/program/detail.routes.ts)                                                                                                                                                                                         | Route/resolver context, `isUserManager`, cancellation и error mapping                     |
| S04 | [drilldown component](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/drilldown/analytics-drilldown.component.ts), [template](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/drilldown/analytics-drilldown.component.html), [state service](../../projects/social_platform/src/app/api/program/facades/detail/program-analytics-drilldown.service.ts)   | Существующая modal/table/search/pagination и управление focus/context                     |
| S05 | [program HTTP adapter](../../projects/social_platform/src/app/infrastructure/adapters/program/program-http.adapter.ts), [repository port](../../projects/social_platform/src/app/domain/program/ports/program.repository.port.ts)                                                                                                                                                                          | `getAllProjects`, `createProgramFilters`, manager analytics endpoints                     |
| S06 | [ExportFileService](../../projects/social_platform/src/app/api/export-file/export-file.service.ts), [ExportFileInfoService](../../projects/social_platform/src/app/api/export-file/facades/export-file-info.service.ts), [saveFile](../../projects/social_platform/src/app/utils/export-file.ts)                                                                                                           | Blob → file-saver → `.xlsx`, существующие all/submitted/rates flows                       |
| S07 | [case analytics service](../../../api/partner_programs/services/project_case_analytics.py), [case field service](../../../api/partner_programs/services/case_fields.py), [models](../../../api/partner_programs/models.py)                                                                                                                                                                                 | Точное `name="case"`, выбор у связи Project × Program, группировка без кейса              |
| S08 | [API URLs на production ref](https://github.com/PROCOLLAB-github/api/blob/2fbc7225d41d59602cc1f870dc66707e2d028420/partner_programs/urls.py), [views на том же ref](https://github.com/PROCOLLAB-github/api/blob/2fbc7225d41d59602cc1f870dc66707e2d028420/partner_programs/views.py), [project filters](../../../api/partner_programs/services/project_filters.py)                                         | Существующие manager list/filter/export и их ограничения                                  |
| S09 | [ProjectListSerializer на production ref](https://github.com/PROCOLLAB-github/api/blob/2fbc7225d41d59602cc1f870dc66707e2d028420/projects/serializers.py), [Project model](../../../api/projects/models.py)                                                                                                                                                                                                 | List не содержит presentation/region/link case; `presentation_address` хранится у Project |
| S10 | [export builder](../../../api/partner_programs/services/exports.py), [xlsx utils](../../../api/core/utils.py)                                                                                                                                                                                                                                                                                              | Колонки, openpyxl, prefetched project/link data, MIME/filename                            |
| S11 | [permissions](../../../api/partner_programs/permissions.py), [analytics views](../../../api/partner_programs/project_analytics_views.py), [permission mixin](../../../api/partner_programs/submission_assignment_views.py)                                                                                                                                                                                 | Server-side program scope и различия порядка 403/404                                      |
| S12 | [program serializer на production ref](https://github.com/PROCOLLAB-github/api/blob/2fbc7225d41d59602cc1f870dc66707e2d028420/partner_programs/serializers/programs.py), [project access](../../../api/projects/access.py), [project permissions](../../../api/projects/permissions.py)                                                                                                                     | `is_user_manager` не равен staff; права просмотра проекта не дают права на аналитику      |
| S13 | [analytics service](../../../api/partner_programs/services/project_analytics.py), [attention serializer](../../../api/partner_programs/serializers/project_analytics_attention.py)                                                                                                                                                                                                                         | Уже вычисляемые evaluation statuses, даты сдачи, safe leader и assignment counters        |
| S14 | [case tests](../../../api/partner_programs/tests/test_project_case_analytics.py), [list/export tests](../../../api/partner_programs/tests/test_program_filters.py), [export row tests](../../../api/partner_programs/tests/test_exports.py), [access tests](../../../api/partner_programs/tests/test_program_filter_access.py)                                                                             | Assertions по buckets, multi-program, `.xlsx`, permissions; в этой задаче не запускались  |
| S15 | [Angular cases tests](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/analytics.component.spec.ts), [drilldown tests](../../projects/social_platform/src/app/api/program/facades/detail/program-analytics-drilldown.service.spec.ts), [attention tests](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/drilldown/analytics-attention.component.spec.ts) | Нулевые кейсы, скрытие withoutCase, поиск, stale requests и UI состояния                  |

Локальные API-ссылки рассчитаны на соседний `api` checkout. Версии изменившихся файлов выше закреплены commit-ссылками.
Документы [project analytics](../../../api/docs/project-analytics-api.md) и [case field](../../../api/docs/program-case-field.md) использованы как навигация; факты сверены с кодом.

## Current behavior

1. Overview загружается через `GET /programs/{programId}/project-analytics/`. Блок `cases` содержит
   `configured`, `submission_applicable`, `items[{name, participants_total, projects_total, not_submitted, submitted}]` и `without_case` [S01–S03, S07].
2. В UI кейсы — неинтерактивные `li.case-row`. Есть название, число проектов, сравнительная полоса,
   число участников и, для конкурсной программы, «Сдано / Не сдано». Список сохраняет порядок backend, включая нулевые варианты [S01].
3. «Без выбранного кейса» показывается только при `projectsTotal > 0` и наличии настроенных вариантов.
   Если определения кейса или options нет, UI показывает сообщение и скрывает весь список, хотя backend относит все связи к `without_case` [S01, S07, S14–S15].
4. Кейс — не отдельная Case entity. Это точный текущий option системного `PartnerProgramField.name="case"`.
   Значение берётся из `PartnerProgramFieldValue.value_text` конкретного `PartnerProgramProject` [S07].
5. Без кейса считаются missing value, пустое/пробельное значение, устаревший option и неточное совпадение
   (например, `a` или `A` при текущем `A`). Frontend не должен самостоятельно нормализовать эти значения [S07, S14].
6. Количество проектов — число связей в выбранной программе. Уникальность пары Project × Program обеспечена моделью.
   Один Project в двух программах может иметь разные case/submitted. Participants — уникальные зарегистрированные в этой программе
   лидеры/Collaborator users внутри bucket; один человек может попасть в несколько buckets. Это не сумма размеров команд [S07].
7. Другие метрики уже открывают `AnalyticsDrilldownComponent`: modal с таблицей, server-side поиском по Enter,
   страницами по 25, retry, Escape, focus trap/return и отменой запросов при смене контекста. Case view отсутствует [S04].
8. Вверху аналитики уже есть «Все проекты», «Сданные проекты», «Оценки проектов». Для первых двух вызывается
   `GET /programs/{id}/export-projects/`, во втором случае с `only_submitted=1`. В самом блоке «Кейсы» export action отсутствует [S01, S06].
9. Формат project export — `.xlsx`, лист «Проекты». Базовые колонки: №, название, описание, регион, ссылка на презентацию,
   размер/состав команды, имя лидера; затем все program fields по `pk` с их текущим `label` [S10].
   Поле case может попасть туда как дополнительное, но обязательное название столбца «Кейс» и отображение bucket без кейса не гарантированы.
   Сейчас exporter не обрабатывает case selector или поиск, только `only_submitted` [S08, S10].

## Target behavior

- Каждая отображаемая строка/карточка кейса открывает детализацию, включая настроенный кейс с нулём проектов.
- Расширить существующую analytics modal новым case view, сохраняя страницу/route и прочие drilldowns.
- Заголовок: `Кейс: {название}`; для служебной группы — `Без выбранного кейса`.
- Список содержит колонки **«Проект»**, **«Лидер или команда»**, **«Сдача решения»**, **«Презентация»** со ссылкой на презентацию.
  Отдельной колонки «Кейс» внутри выбранного bucket нет. Регион остаётся в API/XLSX; размер команды — вторичной информацией рядом с лидером.
  Даты привязки/сдачи доступны для вторичной информации и выгрузки; не требуют ещё двух обязательных широких колонок.
- В заголовке детализации показываются уже существующие метрики bucket, не сумма текущей страницы.
- В блоке «Кейсы» появляется `Выгрузить все проекты`; внутри modal — `Выгрузить все проекты кейса`.
- Обе выгрузки включают все строки выбранного scope, а не только открытую страницу. Общая включает группу без кейса.
- Экспорт сохраняет весь кейс независимо от поиска в modal; рядом явно указать «Все проекты кейса, без учёта поиска» (Q1).
- При отсутствии определения/options сохранить пояснение и показать bucket без кейса, если в нём есть проекты (Q2).
  Это явное UI-изменение текущего empty state, а не изменение правил группировки.

## Users / roles

| Роль                                               | Текущее право API                                        | Текущий Angular UI                                                         | Цель v1                                                                  |
| -------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Manager выбранной программы                        | List/analytics/export разрешены                          | `isUserManager=true`, аналитика доступна                                   | Drilldown и обе выгрузки                                                 |
| Staff / superuser                                  | API разрешён независимо от membership                    | Без manager membership `is_user_manager=false`, analytics facade блокирует | Сохранить API-доступ и существующий UI gate; доступ UI не расширять (Q3) |
| Только expert                                      | Manager list/export/analytics запрещены                  | Нет manager-доступа                                                        | Не расширять                                                             |
| Только participant / project leader / collaborator | Manager endpoints запрещены                              | Нет manager-доступа                                                        | Не расширять                                                             |
| Manager другой программы / посторонний             | 403 для существующей чужой программы                     | Нет доступа                                                                | Не расширять                                                             |
| Anonymous                                          | Авторизация обязательна; существующие DRF flows дают 401 | Приватный flow / повторная авторизация                                     | Не расширять                                                             |

Комбинация ролей использует имеющееся manager/admin право, а не запрет по наличию participant/expert-роли [S03, S11–S12, S14].

## Доступные данные и метрики

«Есть в модели/service» не означает «уже приходит в текущем project list JSON».

| Поле / метрика                                       | Реальный источник                                   | Доступность сейчас                                                                         | Решение v1                                                                                |
| ---------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Project ID / название                                | `Project.id/name`                                   | List, analytics attention, export                                                          | Обязательно; название — существующая ссылка `/office/projects/{id}`                       |
| Кейс / bucket                                        | Текущая программа → system field → link field value | Overview aggregate; raw field в XLSX                                                       | Обязательно; добавить явный scoped JSON, не брать `Project.partner_program`               |
| Презентация                                          | `Project.presentation_address`                      | Detail DTO (`presentationAddress` после casing), XLSX; отсутствует в ProjectListSerializer | Обязательно; включить в новый режим списка                                                |
| Лидер                                                | `Project.leader`, user name                         | List содержит ID; attention имеет safe identity; XLSX имя                                  | Показать имя, без email/телефона/auth-полей                                               |
| Регион                                               | `Project.region`                                    | Detail, aggregates, XLSX; отсутствует в базовом list                                       | Сохранённое значение в API/XLSX; отдельная UI-колонка не входит в утверждённый дизайн     |
| Размер команды                                       | `Collaborator` + лидер                              | Export `_calc_team_size`: `1 + число collaborator rows`                                    | Повторить существующую export semantics; не называть числом зарегистрированных участников |
| Сдача решения                                        | `PartnerProgramProject.submitted`                   | Overview, attention/assignment services                                                    | Только у текущей связи; для noncompetitive отображать «Не требуется»                      |
| Дата сдачи                                           | `PartnerProgramProject.datetime_submitted`          | Attention/assignment JSON                                                                  | Вторичная информация / XLSX; null не заменять датой проекта                               |
| Дата привязки                                        | `PartnerProgramProject.datetime_created`            | Not-submitted drilldown                                                                    | Вторичная информация / XLSX; это не дата создания Project                                 |
| Участники / всего / сдано / не сдано по кейсу        | `build_project_case_analytics`                      | Overview                                                                                   | Повторить в header выбранного bucket; не пересчитывать из страницы                        |
| Оценивание / назначено / завершено                   | `_annotated_solution_rows`, assignment services     | Attention endpoints и overview; open/distributed semantics различаются                     | Не входит в v1 (Q4)                                                                       |
| Описание / состав команды / остальные program fields | Project, Collaborator, link field values            | Legacy XLSX и частично detail                                                              | Существующая полная выгрузка сохраняется; не добавлять всё в drilldown                    |

Источник презентации — именно **Project**, не `PartnerProgram.presentation_address`, не URL cover и не произвольное file-поле программы.
Это актуальная редактируемая ссылка проекта, не snapshot на момент сдачи. Без значения UI показывает «Не добавлена», файл — пустую ячейку.
UI открывает обычную безопасную HTTP(S)-ссылку в новой вкладке с `noopener`; доступность внешнего документа заранее не обещается.
Не загружать ProjectDetail по одному запросу на каждую строку и не делать HEAD-запросы ко всем презентациям [S09–S10].

## Business rules

1. Единственная область данных — выбранная программа и её `PartnerProgramProject`; не смешивать Application/Submission/Evaluation.
2. Список включает все связанные проекты независимо от `draft`, `is_public` и `submitted`, как исходные case aggregates.
   Признак `draft` не заменяет состояние сдачи решения.
3. Для конкретного кейса использовать точное текущее имя option. Порядковый frontend key `case:{index}` не является ID кейса.
4. Selector служебного bucket должен быть отдельным типом; строка «Без выбранного кейса» может быть настоящим названием option.
5. Missing/blank/obsolete/nonexact — один existing without_case bucket. Не исправлять сохранённые значения при чтении.
6. При неизменных данных число строк без search равно `projects_total` bucket; сумма project buckets с without_case равна общему числу связей.
   Участников между buckets не суммировать. Метрики bucket относятся ко всем его проектам, даже при применённом поиске.
7. При `submission_applicable=false` не показывать «Не сдано» как проблему; raw submitted хранится, но UI/XLSX status — «Не требуется».
8. Export all содержит весь scope программы; export selected/without_case — весь соответствующий bucket. Общий export не зависит от открытой modal.
9. Новые операции read-only; lifecycle, deadlines, case selection/locking и evaluation rules сохраняются.
10. Модальное окно при каждом новом открытии сбрасывает search/offset и старые данные. Смена программы закрывает его и отменяет загрузку.
11. Поиск v1 — по имени проекта, `icontains` после trim; применяется по Enter, очистка/новый search сбрасывают offset.
12. Если данные изменились между overview и detail/export, допустима разница между моментами чтения. После refresh на стабильных данных counts должны сходиться;
    не обещать транзакционный snapshot между независимыми HTTP-запросами.

## UI changes

- Сохранить композицию и шкалу блока «Кейсы», добавив семантический button для открытия каждой строки и видимый focus.
  Enter/Space должны работать; нулевые настроенные кейсы остаются открываемыми.
- При пустом bucket без кейса сохранять текущее скрытие строки; если уже открытая группа стала пустой, показывать корректный empty state.
- Расширить существующие `AnalyticsDrilldownComponent` / state service новым view, не создавать второй независимый modal или table primitive.
- Desktop — именованные table columns; mobile — существующие labelled rows с переносом длинных названий и ссылок.
- Сохранить header/close во время loading и error, focus trap, Escape/backdrop close, возврат focus на исходную карточку.
- Loading, empty, no results, error/retry, unauthorized, forbidden и not_found различаются; error не превращается в «0 проектов».
- Export имеет локальные pending/error, блокирует повторный клик, не блокирует закрытие modal и не скрывает список при ошибке.
  При смене программы/кейса поздний ответ не скачивается под новым контекстом/именем файла.
- На стабильном пустом scope export-кнопка disabled; если данные опустели уже после клика, сервер может вернуть XLSX только с заголовками.
- Существующие верхние «Все проекты / Сданные проекты / Оценки проектов» сохраняют прежнее поведение и формат.

Design sources: [Figma DS](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE/PROCOLLAB-Design-System-v1),
[design-system.json](../../design-system.json), [Analytics pattern](../design-system/patterns/analytics.md),
[Table](../design-system/components/table.md), [Modal](../design-system/components/modal.md),
[Button](../design-system/components/button.md), [Search](../design-system/components/search.md), [Pagination](../design-system/components/pagination.md), [States](../design-system/states.md).
Mont остаётся canonical; Inter только Figma preview. Общего runtime Table primitive пока нет: использовать существующую analytics table family.
D01–D05 остаются PROPOSED. Feature-дизайн утверждён отдельно, ссылки приведены в Approved design; это не утверждение глобальных DS-миграций.

## API changes — утверждённое совместимое расширение

**Новые endpoints не требуются.** Реализовать явный opt-in режим `view=case_analytics` у двух существующих manager endpoints.
Имена новых query/response полей ниже — утверждённый контракт реализации, а не утверждение об их наличии в deployed API.

### Почему не использовать текущий ответ без изменений

- `GET /programs/{id}/projects/` уже возвращает нужную исходную population и имеет server-side permissions,
  но его `ProjectListSerializer` не содержит presentation, case/link context, регион и необходимые даты [S08–S09].
- `POST /programs/{id}/projects/filter/` умеет `{"filters":{"case":["A"]}}` для допустимого option,
  но требует filterable field и значения из options; отсутствующие/устаревшие значения не выражают without_case.
  Он возвращает тот же сокращённый project serializer [S08].
- Существующие attention endpoints отбирают только несданные/ожидающие оценки проекты и не покрывают полную case population [S13].
- Frontend-fetch всех страниц и всех ProjectDetail создаст N+1 и расхождения counts. Это не замена расширению API.

### Список

```text
GET /programs/{programId}/projects/?view=case_analytics&case_scope=selected&case_name={encodedExactName}&limit=25&offset=0&search={query}
GET /programs/{programId}/projects/?view=case_analytics&case_scope=without_case&limit=25&offset=0
GET /programs/{programId}/projects/?view=case_analytics&case_scope=all&limit=25&offset=0
```

- Без `view` — прежний serializer, pagination и поведение; opt-in — отдельная проекция manager list внутри существующего view/service flow.
- Новый query validator: `case_scope` обязателен (`all | selected | without_case`); для selected обязательно точное непустое `case_name`.
  В других scopes `case_name` запрещён. Неизвестный option или несовместимые параметры — 400, не fallback на все проекты.
- `case_name` не trim/casefold; кодировать стандартным HttpParams, сохраняя `+`, `&`, `%`, Unicode.
- `limit`: default 25, диапазон 1–100; `offset >= 0`; search — по правилу выше. Это ограничения нового режима, не глобальная смена legacy pagination.
- Стабильный порядок нового списка: `PartnerProgramProject.datetime_created ASC, pk ASC`.
- Формат страницы: `count`, `next`, `previous`, `results`, плюс `selection`, `cases_configured`, `submission_applicable`, `case_metrics`.
  `count` учитывает search; `case_metrics` для selected/without_case повторяет четыре метрики полного bucket без search.
  Для all `case_metrics=null`: не вводить сумму уникальных участников разных кейсов.
- `selection` содержит `scope` и `case_name` (null вне selected); `results` содержит строки следующей формы:

```json
{
  "program_project_id": 421,
  "project": {
    "id": 81,
    "name": "Название проекта",
    "presentation_address": "https://example.org/presentation.pdf",
    "region": "Москва"
  },
  "case": { "kind": "selected", "name": "Точное название кейса" },
  "leader": { "user_id": 15, "full_name": "Имя Фамилия" },
  "team_size": 3,
  "linked_at": "2026-09-01T10:00:00Z",
  "submitted": true,
  "submitted_at": "2026-09-20T10:00:00Z"
}
```

Пример синтетический. Для without_case: `case.kind="without_case", case.name=null`; UI ставит системную подпись.
`presentation_address`, `region`, `submitted_at` допускают null; отсутствие leader обрабатывается защитно как null.
`submitted_at` отдавать null для несданной связи; исторический null у сданной не заменять выдуманной датой.
Backend выбирает field/link только из текущей программы; не использовать singular `ProjectListSerializer._get_program_link()`.
Новый serializer локален manager view и не расширяет публичный ProjectListSerializer.
Безопасная идентичность лидера — по существующему analytics contract, без полной User-сериализации.

### Выгрузка

```text
GET /programs/{programId}/export-projects/?view=case_analytics&case_scope=all
GET /programs/{programId}/export-projects/?view=case_analytics&case_scope=selected&case_name={encodedExactName}
GET /programs/{programId}/export-projects/?view=case_analytics&case_scope=without_case
```

- Повторно использовать exporter/openpyxl/response helper, общую server-side выборку и bucket classifier со списком/overview.
- Новый режим не принимает `limit`, `offset`, `search`, `only_submitted`; противоречивые параметры возвращают 400.
  Это исключает случайную выгрузку только страницы или только сданных проектов. Без `view` старый `only_submitted` сохраняется.
- `.xlsx`, лист «Проекты»; обязательная фиксированная колонка **«Кейс»** независимо от текущего label системного поля.
- Порядок новых колонок: №, Название проекта, Кейс, Ссылка на презентацию, Лидер, Регион,
  Размер команды, Сдача решения, Дата привязки к программе, Дата сдачи решения.
- В without_case писать «Без выбранного кейса»; не подменять эту подпись raw obsolete значением.
- URL презентации писать полностью как значение, без построения `HYPERLINK`-формулы из пользовательского ввода.
  Имена/кейсы с ведущим `=` должны оставаться текстом. Текущий `sanitize_excel_value` чистит управляющие символы/длину,
  но сам по себе не гарантирует literal cell type; это отдельная проверка нового режима.
- Для дат использовать однозначный текст ISO 8601 с timezone; null — пустая ячейка. В UI — существующий DatePipe.
- Состав и порядок строк — как полный список нового режима без search; файл all включает все buckets, включая без кейса.
- Имя файла должно различать «все кейсы», выбранный кейс и without_case; program/case label санитизировать.
  Согласовать frontend filename с backend, поскольку текущий `saveFile` формирует имя самостоятельно [S06, S10].

### Compatibility / внедрение

Старые URL без нового режима, JSON fields, pagination и XLSX columns остаются прежними.
Generic POST filter, project CRUD, верхние legacy exports и `/project-analytics/` агрегаты не меняют семантику.
Общий bucket selector — небольшая функция существующего case analytics service, не новый доменный слой/сервисная архитектура.
Сохранять bounded queries/select_related/prefetch; не добавлять запрос на каждую строку или каждый кейс.
Внедрять backend → проверить новые selectors/формат → frontend. Старый backend может молча игнорировать новые query params:
новый UI должен проверять наличие согласованного response contract; fallback на нефильтрованный список/export запрещён.
Кнопки нового export активировать только после подтверждения нового list-контракта для соответствующего program/scope;
успешный legacy overview сам по себе не подтверждает поддержку нового режима. Rollout list и export выполняется одной backend-версией.

## Data changes

Новых таблиц, моделей Case, колонок и data migrations не требуется.
Добавляются только query/response DTO и новый режим формирования XLSX из существующих Project/Program link/field/user данных.
Raw case values и historical submitted timestamps не нормализуются и не исправляются этой feature.
Новые поля в API не являются новыми бизнес-сущностями.

## Permissions

- Расширять только существующие manager endpoints с `IsAdminOrManagerOfProgram`; frontend checks не являются защитой.
- Любой selector/search/export проходит server-side проверку конкретной программы до возврата её данных.
- Передача имени кейса другой программы не открывает её связи; одинаковые имена не расширяют scope.
- Права видеть отдельный Project или filters schema не дают право видеть analytics/export программы.
- Сохранять существующий порядок ошибок выбранных endpoints: для несуществующей программы обычный manager получает отказ
  permission (403), staff/superuser проходят permission и получают 404. У `/project-analytics/` lookup через ProgramPermissionMixin
  устроен иначе; не переносить его 404-семантику в существующий list/export молча [S08, S11].
- Request существующей чужой программы: 403; anonymous: 401. Проверить ответы и отсутствие project/presentation payload.
- Не включать email, телефон, user auth attributes, case values другой программы или полную private profile модель.
- Новый drilldown/export не даёт права редактировать проекты, кейсы, состав команды или оценку.

## Edge cases

| Ситуация                                                     | Ожидаемое поведение                                                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Настроенный кейс, проектов 0                                 | Click работает, count=0, empty message, export disabled                                         |
| Missing / пустой / пробельный / старый / неточный case value | Та же группа without_case в overview/list/XLSX                                                  |
| Нет определения case или options                             | Пояснение сохранено; показывать without_case при projects_total>0 по Q2, all export доступен    |
| Настоящий option называется «Без выбранного кейса»           | Отличается от служебной группы по typed selector, не по label                                   |
| Project участвует в двух программах                          | Кейс/сдача/даты только нужной связи; presentation может быть общей текущей ссылкой Project      |
| Нет презентации / ссылка удалена после загрузки              | Пустое состояние; не подставлять presentation программы; ошибка внешнего URL не скрывает проект |
| Noncompetitive                                               | Проекты доступны; статус сдачи «Не требуется», не false alarm «Не сдано»                        |
| Search дал 0 при непустом кейсе                              | «По запросу ничего не найдено»; export всего кейса остаётся доступен и явно подписан            |
| Переключение кейса/программы, закрытие во время запроса      | Cancel/reset; late result не попадает в другой scope и не запускает чужой download              |
| Case option удалён между открытием и запросом                | 400 с понятным сообщением и обновлением overview; не fallback на all                            |
| Проект сменил кейс/удалён между page/export запросами        | Новые ответы отражают текущее состояние; refresh, без ложного обещания snapshot                 |
| Очень длинное имя / Unicode / символы query                  | Полный текст доступен, layout не ломается, HttpParams сохраняет exact matching                  |
| Несколько страниц / offset за count                          | count корректен, results могут быть []; экспорт всё равно полный scope                          |
| Network/5xx/403 при export                                   | Контролируемая локальная ошибка, без файла и без маскировки ошибки как успеха                   |

## Out of scope

- Изменение case definitions, переименование options, assignment экспертов, lifecycle, дедлайнов и правил оценивания.
- Перенос на React / Application / Submission и создание новой архитектуры или export platform.
- Изменение доступа staff/superuser к Angular-вкладке (Q3); новые permissions и массовое исправление соседних flows.
- Новый route/deep link для каждого кейса, sorting UI, CSV/PDF, zip с файлами презентаций, preview документа.
- Суммарный рейтинг/средний балл проекта, новые evaluation метрики или аналитика участников по строкам проекта.
- Исторический snapshot презентации/данных, уведомления, auto-refresh и миграция ошибочных legacy values.
- Миграция всей DS, новый shared Table/Modal, изменение Mont или Figma-файла в рамках этой spec-задачи.

## Acceptance criteria

Критерии ниже — цели будущей реализации, **не выполненные проверки текущей задачи**.
Q1–Q4 и UI-дизайн утверждены; выполнение AC подтверждается отдельно backend/frontend evidence.

| ID   | Проверяемый результат                                                                                                                                                             | Как проверить                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AC01 | Manager программы открывает любой отображаемый кейс кликом/Enter/Space; в modal правильные title/scope, включая нулевой кейс                                                      | Angular component test + browser keyboard                    |
| AC02 | Без search при стабильных данных count детализации равен projects_total карточки; ни одна строка другого кейса/программы не попадает в список                                     | Backend fixtures и list/overview parity                      |
| AC03 | В каждой строке есть название и презентация из Project.presentation_address; отсутствие показано явно. Case остаётся в scoped JSON/XLSX, но отдельной UI-колонки «Кейс» нет       | Serializer/DTO/component tests                               |
| AC04 | Лидер/команда и сдача показаны по согласованным sources; регион доступен в API/XLSX, размер команды — во вторичной UI-информации; значения не требуют N запросов ProjectDetail    | Backend query check + browser/network                        |
| AC05 | Missing/blank/whitespace/obsolete/nonexact values попадают в without_case одинаково в overview/list/export; настоящий одноимённый option не смешивается с ним                     | Case fixtures с `A`, `a`, `A`, obsolete и literal label      |
| AC06 | При отсутствии case definition/options существующие проекты доступны через without_case по принятому Q2; при полностью пустой программе false data не создаются                   | API/component fixtures                                       |
| AC07 | Общий XLSX из блока содержит каждый project link программы один раз, включая without_case и все страницы; есть «Кейс» и полная ссылка на презентацию                              | Прочитать workbook, сравнить строки с all queryset           |
| AC08 | XLSX из selected/without_case содержит только полный выбранный bucket, включая строки за текущей страницей; не зависит от search по принятому Q1                                  | Fixture >25 проектов, search, page 2, сравнение IDs/названий |
| AC09 | Legacy list/filter и legacy all/submitted/rates export без нового режима сохраняют прежний формат, payload и semantics                                                            | Existing backend/frontend contract/export tests              |
| AC10 | Поиск по Enter фильтрует имя проекта, сбрасывает offset; pagination стабильна, count и range корректны; retry сохраняет search/scope                                              | Facade/component + backend pagination tests                  |
| AC11 | Participant, expert-only, foreign manager не получают list/export даже прямым HTTP-запросом; staff API-доступ сохранён; 401/403/404 соответствуют существующему endpoint behavior | Permission matrix API tests                                  |
| AC12 | Для Project в двух программах detail/export используют case/submitted/link dates выбранной программы и не показывают field values второй                                          | Multi-program backend test                                   |
| AC13 | Noncompetitive UI/XLSX показывает «Не требуется», не требует submit и не меняет raw flags; submitted historical null date отображается без выдуманной даты                        | Serializer/component/export tests                            |
| AC14 | Loading/empty/no results/error/forbidden/not_found различимы; ошибки не превращаются в 0, пустой файл или success                                                                 | Facade/component negative scenarios                          |
| AC15 | После смены scope/route/закрытия поздний ответ не меняет UI и не скачивает файл; повторный export click во время pending не создаёт второй запрос                                 | Cancellation/race tests                                      |
| AC16 | Mobile labels, длинные русские названия, focus trap, Escape и возврат focus работают; Mont и существующий Analytics/Table/Modal contract сохранены                                | Browser responsive/keyboard + DS audit                       |
| AC17 | Invalid selector, unknown option, неподходящие query params дают 400; не возникает тихой выгрузки all вместо выбранного кейса                                                     | Backend query validation + integration old-server scenario   |
| AC18 | `.xlsx` открывается, заголовки/имя файла корректны, URL не обрезан, пользовательские `=`-значения остаются текстом; нулевой результат после запроса — header-only workbook        | Workbook assertions                                          |
| AC19 | Новый режим не делает writes и не меняет query budget overview; detail queries не растут линейно с числом строк из-за N+1                                                         | DB write/query capture, 1 и 100 строк                        |

## Risks

- **Расхождение scopes:** generic filter не эквивалентен without_case; classifier должен быть общим с существующей аналитикой.
- **Compatibility:** опциональный режим обязан быть изолирован от default ProjectListSerializer и старых XLSX consumers.
- **Старый backend:** новые query params сейчас игнорируются; включение UI до backend способно выдать все проекты вместо кейса.
  Нужен backend-first rollout, подтверждённый list contract и интеграционная проверка export.
- **Права staff:** API и UI сейчас различаются; исправление без решения будет расширением scope.
- **Семантика команды:** export считает 1+Collaborator rows, а case participants — distinct зарегистрированных users.
  Не унифицировать формулы молча; отдельно показать пользователю смысл метрик.
- **Объём:** существующий XLSX builder формирует workbook в памяти; максимальный размер программ и допустимое время выгрузки не измерены.
  Сохранить текущий подход, проверить репрезентативный объём; background export — только по измеренной необходимости.
- **Живые данные:** список, overview и XLSX могут расходиться во времени; snapshot/версионирование вне scope.
- **Презентация:** ссылка общая для Project, может быть внешней/недоступной; не обещать архивную версию или доступ без авторизации.
- **Source baseline:** production ref не равен подтверждённому deployed SHA; перед implementation проверить актуальные изменения и CI.

## Implementation areas / план следующего этапа

| Шаг | Область                                                                                                                           | Результат / AC                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Выполнено: Q1–Q4 и дизайн `procollab-design-screen` утверждены; см. Approved design                                               | Основание реализации; runtime AC пока не отмечаются выполненными                                                  |
| 2   | API: `partner_programs/services/project_case_analytics.py`, существующие list/export views, отдельные query/response serializers  | Общий typed selector, scoped list projection, новый режим без changes default; AC02–05, AC09, AC11–13, AC17, AC19 |
| 3   | API: `partner_programs/services/exports.py`, существующие xlsx helpers                                                            | Scope-aware workbook с фиксированными case/presentation columns; AC07–09, AC18                                    |
| 4   | Angular: program domain/port/repository/HTTP adapter и use-case; `ProgramAnalyticsDrilldownService`                               | Новый DTO и case context без смешивания с ProjectDetail; pagination/search/cancellation; AC02–05, AC10, AC14–15   |
| 5   | Angular: analytics component/template/styles, existing drilldown component/template/styles, export service/facade/filename helper | Кликабельные кейсы и две выгрузки с независимыми состояниями; AC01, AC06–08, AC13–16                              |
| 6   | Backend tests + Angular targeted tests/build + browser QA                                                                         | Evidence для AC01–19, compatibility верхних exports и прочих drilldowns                                           |
| 7   | `procollab-review`, затем `procollab-pr`                                                                                          | Requirement audit AC → code → evidence → verdict; связанные API/Angular PR и порядок rollout                      |

API тесты расширять рядом с `test_project_case_analytics.py`, `test_program_filters.py`, `test_exports.py`,
`test_program_filter_access.py`; regression также охватывает `test_project_analytics_api.py` и `test_project_analytics_attention_api.py`.
Frontend опираться на существующие analytics/drilldown/facade/adapter specs и добавить export assertions для нового режима.
Конкретные test labels/команды выбрать по актуальному repo; Angular source baseline использует Vitest `npm run test:ci` и `npm run build:pr`.
Даты/ошибки/права и XLSX проверять assertions, а не только snapshots DOM. Runtime проверки выполняются на этапе реализации.

## Resolved questions / assumptions

| ID  | Утверждённое решение                                                            | Влияние                                                             |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Q1  | Export внутри case drilldown выгружает весь кейс независимо от поиска           | Export не принимает search/limit/offset; AC08                       |
| Q2  | without_case показывается при наличии проектов даже без case definition/options | Пояснение сохраняется; backend grouping не меняется; AC06           |
| Q3  | Staff/superuser UI access в этой feature не расширяется                         | Существующий Angular gate и server-side API permissions сохраняются |
| Q4  | Evaluation metrics не входят в v1                                               | Нет новых evaluation полей, колонок или вычислений в case contract  |

Assumptions: target — legacy Angular аналитика, обычная таблица в существующей modal, `.xlsx`, текущая ссылка Project,
без отдельного deep link на кейс и без редактирования. Технические имена opt-in параметров/DTO приняты для реализации.
Неизвестный deployed SHA остаётся ограничением исходного исследования, а не открытым продуктовым вопросом.

## Verification этой specification

- **Checked by source:** frontend/API models, views, permissions, case grouping, presentation source, exporter, DS patterns и assertions существующих тестов; сравнение relevant refs.
- **Checked by tests:** product/runtime tests не запускались; выполнена только статическая проверка ссылок/форматирования документа.
- **Checked by build:** не запускался; runtime code не менялся.
- **Checked in browser:** не выполнялось; доступные состояния установлены по source.
- **Not checked:** deployed SHA, live dataset/permissions/ссылки презентаций, производительность XLSX, runtime browser/accessibility приёмка.

Итог specification/design этапа — утверждённые требования и макет, не готовая runtime feature. Backend и Angular verification фиксируются на соответствующих этапах реализации.

Backend implementation evidence (28.09.2026): [API contract, актуальный source baseline и AC audit](../../../api-analytics-case-drilldown/docs/analytics-case-drilldown-api.md).
Этот отчёт отделяет backend PASS от оставшейся Angular/browser приёмки; утверждённые требования выше не меняются.
