<!-- @format -->

# Повторная проверка требований и кода

Вердикт: **insufficient evidence для полной приемки/merge; draft PR пригоден для ревью**. Стандартная production-сборка теперь проходит. В исправленном клиентском scope actionable BLOCKER/MAJOR/MINOR не осталось. Непроверенная запись в реальный dev API и различия исторической Figma/общего V1 не скрываются этим выводом.

## Requirement audit

| AC | Требование | Реализация и доказательство | Вердикт |
| --- | --- | --- | --- |
| 1 | Аудит всех экранов управления | README: карта всех маршрутов и модальных окон; ACCEPTANCE: 14 экранов, семь настроек, свежие Figma metrics/PNG, обе версии | PASS в границе управления |
| 2 | Устранить или документировать визуальные расхождения | Общие roster, controls, progress, таблицы и dialog presets; новая галерея; явный список исключений Figma/V1 | PASS для аудита и документирования; окончательное визуальное ревью открыто |
| 3 | Переиспользовать UI | ExpertRoster, EvaluationProgressSummary, expert-presentation, native controls, management-list, analytics-table/dialog, общий mixin portal body | PASS |
| 4 | Сохранить Project/Solution | Domain, API adapters, routes и guards не менялись; идентификаторы и preview/apply обработчики сохранены; C00 типовой контракт и tests | PASS на клиенте |
| 5 | Сохранить работу V1/V2 | Tests и настоящие UI с fixtures, сравнение обеих версий с 44761cdc; реальных organizer записей нет | NOT VERIFIED полностью |
| 6 | Проверить desktop/mobile | 320/390/768/1440/1920; заполненные списки, forms, dialogs, states, menus, focus | PASS для зафиксированных сценариев |
| 7 | Доказать результат снимками/тестами | Галереи, JSON, PNG, логи и fingerprints; уровни mock/live явно разделены | PASS |
| 8 | Обычная production-сборка | NG_BUILD_MAX_WORKERS=2 npm run build:prod: exit 0, исходные budgets/font inlining; 46 проверок именно этого артефакта | PASS |
| 9 | Установить причину API blocker | Публичные dev GET 200, management/settings/experts/assignments 401 без сессии; production не использован | PASS для диагностики, NOT VERIFIED для live organizer scenarios |
| 10 | Проверить Git/подготовить PR | dev base совпадает; ветка локальная, dry-run push разрешен; только коммиты задачи, чистота и remote ref проверяются после commit/push | См. итоговый Git-результат |

## Checked by source

Повторный diff относительно `44761cdc` и dev: бизнес-обработчики, API payloads, permissions, модели и маршруты не менялись. Новая TS-логика ограничена presentation: выбор CSS-класса диалога, initials и безопасная ссылка аватара. Новый профиль аналитики использует userId, решение — solutionId. Нет новых зависимостей, миграций и production config overrides.

SCSS выделен по ответственности и реально используется обеими версиями. Это не увеличение max error budget: каждый stylesheet проверяется прежним лимитом. V2 заявки больше не получают все стили shell/settings. Generic native controls имеют Emulated scope; AnalyticsDrilldown с ViewEncapsulation.None получает только именованные analytics selectors и прежний scoped input. Portal-body правила ограничены именами модальных окон аналитики/экспертов. Внешние computed-style probes до/после совпадают.

Удаленные Material Icons links не имеют consumers: поиск material-icons/mat-icon/fontIcon/MatIcon не нашел использования. SVG и локальные шрифты Mont не удалены. Это единственная оправданная правка общего index.html вне страниц программ.

Однократный финальный Impeccable detector отметил существующий `border-left: 4px solid var(--red)` в аналитическом alert. Это сохраненное оформление V1, а не внесенная V2 декорация; generic detector не является основанием менять согласованный UI. Других findings в затронутом scope нет.

## Checked by tests

Полный настроенный Vitest-набор: 498 файлов, 3089 passed / 0 failed / 0 pending по последнему результату каждого файла. Существующие три exclusions сохранены. После семи падений селектора glyph × два spec-файла используют прежнее доступное имя кнопки; focus/lifecycle assertions не удалены и не ослаблены. Финальный replay четырех файлов — 107 passed. Все исходные попытки и replay есть в архиве.

Solution type contract, адресные ESLint 18 TS, Stylelint 19 SCSS, Prettier 29 TS/HTML и git diff --check проходят. Глобальные команды auto-fix не запускались. Финальные новые product файлы входят в эти проверки.

## Checked by build

Обычный `NG_BUILD_MAX_WORKERS=2 npm run build:prod` — exit 0. Budgets/angular.json/package dependencies неизменны. Весь набор пяти CSS failures существовал на исходном dev; Google Fonts 403 воспроизведен на 44761cdc и объяснен сетевой политикой для неиспользуемой ссылки. Ошибки исправлены, а не подавлены. Сохраняются исходные toolchain warnings; см. полный лог.

## Checked in browser

Настоящий Angular, Chromium, изолированные fixtures. 140 заполненных основных страниц, 400 взаимодействий, 75 дополнительных проверок диалогов/данных, 40 состояний и 5 визуальных контрактов на пяти ширинах; все успешны. Стандартный production-артефакт отдельно: 16 страниц и 30 dialog/data проверок на 390/1440 px; все успешны.

Повторно проверены Figma metrics/17 свежих PNG и текущий V1. Экспертные модальные окна имеют измеренные presets 560/600/680, аналитика — 880/980/1100; проверяются мобильные ограничения ширины. Заполненный roster: 25 экспертов, selection между страницами и статусы. Просмотр оценок сохраняет 0/false/comment. Проверены реальные click по каждому меню распределения V1/V2, Escape/focus trap/возврат фокуса, error/retry/loading/403/disabled и формы всех настроек.

Сравнение 140 снимков с `44761cdc` сохраняет размеры страниц. Ожидаемое изменение основных V1 — меню распределения на мобильных ширинах. Подробные пиксельные результаты не подменяют ручную сверку Figma. Историческая Figma и общий текущий редактор сертификатов/формы имеют описанные отличия, вынесенные на финальное визуальное ревью.

## Not checked / риски

На реальном dev выполнены публичные GET программ и списков Project/Solution и отрицательная проверка анонимного management доступа. Без сессии организатора остальные endpoints возвращают 401. Не проверены серверные записи/повторное чтение настроек, assignment mutations, оценивание/пересчет, конкурентный preview/apply, реальные роли, email, Excel/PDF и выдача сертификатов. Fixtures доказывают клиентское поведение, но не эти свойства сервера.

Остаточные риски: реальные данные/большие списки вне fixtures; серверные конфликты и права; браузеры кроме Chromium; расхождения актуальной общей реализации и исторических макетов. Требуется dev-прогон под организатором V1/V2 и финальный просмотр перечисленных визуальных исключений. Merge, deploy и миграции не выполнялись.
