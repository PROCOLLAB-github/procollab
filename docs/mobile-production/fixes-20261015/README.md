<!-- @format -->

# Исправления мобильной production-версии

Дата: 15.10.2026. Ветка: `fix/prod-mobile-polish-20261015`, target: `master`.
Baseline: `4bee93397da2fa2b06a5557b13496beda894921b` — master после merge #408.
Ветка основана непосредственно на master; другие изменения dev не включены.

## Результат и acceptance audit

Все новые стили ограничены шириной до 999px. Шаблоны desktop сохранены.
Runtime TypeScript, API endpoints/payloads, permissions, роли, дедлайны, правила оценки,
300ms debounce, фильтрация, pagination и autosave не менялись. Mont и production tokens сохранены.

| AC  | Требование                                                      | Реализация / проверка                                                                                                                                            | Verdict |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | Публикация новости на своём месте                               | NewsForm: submit в footer, 44×44, рядом с вложениями; реальная отправка form через DOM и pending в unit test                                                     | PASS    |
| 2   | Навыки читаются горизонтально                                   | ProjectDirectionCard: контейнеры полной ширины, категории с wrap; Apache Kafka / hard / Back-end и длинные названия                                              | PASS    |
| 3   | Компактные оценки                                               | RangeCriterionInput: 48×44, сокращён padding; 12px между критериями, длинные подписи переносятся; ввод 8 и blur                                                  | PASS    |
| 4   | Рабочий фильтр оценок                                           | Окно вынесено из desktop-only условия мобильной ветки; выбор кейса → URL → POST payload → список; повторное открытие и сброс; Escape из окна                     | PASS    |
| 4a  | Фильтр оценки без дополнительных полей                          | Переключатель виден и при пустом списке program fields; div вместо label предотвращает повторный синтетический click на checkbox                                 | PASS    |
| 5   | Аналитика курса в одну строку                                   | Кнопка занимает ширину своей колонки; nowrap и отступы; 320/390/768px                                                                                            | PASS    |
| 6   | Номера заданий по центру                                        | Lesson: flex-центрирование, 44×44; 12 пунктов, включая двузначные номера; горизонтальный scroll                                                                  | PASS    |
| 7   | Создать проект в одну строку                                    | Projects: ширина по содержимому и nowrap; при нехватке места заголовок/кнопка занимают отдельные строки                                                          | PASS    |
| 7a  | Две карточки в строке                                           | Dashboard, списки проектов/участников и списки программы: две гибкие колонки; без изменения приглашений; тег навыка в карточке участника ограничен одной строкой | PASS    |
| 7b  | Пустая выдача остаётся широкой                                  | Projects/all и Members: app-state занимает обе колонки, 320/390/768px                                                                                            | PASS    |
| 8   | Панель новости не прижата к краю                                | FeedNewsModal: действия вынесены из scroll, нижний padding 24px + safe area, CTA виден                                                                           | PASS    |
| 9   | Пустые данные конкурса без грустного лица и наложения подсказки | ProjectAdditionalStep: удалён sad-smile в мобильной пустой ветке; кнопка и tooltip в одном flex-ряду, подсказка вне ссылки                                       | PASS    |
| 10  | Desktop сохраняет production                                    | 109 точных RGB comparisons, 1000/1440/1920px; без masks/tolerance                                                                                                | PASS    |

## Evidence

**Checked by source:** итоговый diff относительно master; геометрия только в max-width:999px;
старые desktop-ветки HTML, API и runtime TS сохранены. Review: actionable findings не осталось.
Проверены hierarchy, плотность двух колонок, длинный текст, empty/no-results, pending,
keyboard/названия controls и отсутствие побочных изменений. Существующие правила доступа не изменялись.

**Checked by tests:** `npm run test:ci` — 413 файлов / 2103 теста, exit 0.
Добавлены четыре regression case: mobile filter projects/rating, rated checkbox без полей,
footer submit/pending. Исходные validation/permissions/service tests также прошли.

**Checked by build:** `npm run build:prod` — exit 0; budgets не повышались.
Существующие CommonJS warnings сохраняются. Windows-команда build:sprite передаёт quoted glob некорректно;
для обеих visual-сборок восстановлен один и тот же tracked production sprite с symbol nodes.
CSS/JS bundles не патчились; исправление генератора sprite вне scope.

**Static checks:** `npm run lint:ts` — 0 errors, 6 прежних unused-disable warnings;
Stylelint 16 изменённых SCSS — exit 0; `git diff --check` — exit 0.
`npm run format:check` проверяет полный staged index с LF, как на Linux CI.

**Checked in browser:** Chrome/Windows, synthetic API без live mutations.
Mobile 320/390/768px: 9 новых состояний + выбранный фильтр/пустые program fields;
реальный select → query → POST → no results → reset, ввод оценки, 12 номеров урока,
две колонки и широкая пустая выдача. Основная прежняя матрица 16 страниц + 6 состояний также проходит.
Сохранены проверки разных ролей программы, уведомлений, редакторов, кнопок с иконками и приглашения.

Desktop comparison: [66 основных состояний](./desktop-comparison.json),
[27 состояний текущих правок](./desktop-polish-comparison.json),
[16 дополнительных состояний](./desktop-layout-comparison.json).
В каждом сравнении 0 изменённых RGB pixels; viewport и данные одинаковые.
[Мобильные метрики](./mobile-polish.json), [empty/grid проверки](./grid-edge-cases.json).

## Визуальный review

[Отправка новости](./screenshots/composer-390.png) · [Навыки](./screenshots/skills-390.png) ·
[Оценки](./screenshots/rating-390.png) · [Фильтр](./screenshots/filters-selected-390.png) ·
[Курс](./screenshots/course-390.png) · [Урок](./screenshots/lesson-390.png) ·
[Проекты](./screenshots/projects-grid-390.png) · [Участники](./screenshots/members-grid-390.png) ·
[Новость](./screenshots/news-modal-390.png) · [Данные для конкурса](./screenshots/competition-empty-390.png).

## Воспроизведение

Используйте browser env из [основного отчёта](../README.md#воспроизведение-browser-gate).
Сначала соберите baseline указанного master SHA и сохраните dist отдельно, затем текущую ветку.
`QA_BUILD_ROOT` должен указывать на нужную сборку с полноценным sprite.

`node docs/mobile-production/polish-regression.cjs baseline '320,390,768,1000,1440,1920' OUTPUT`

`node docs/mobile-production/polish-regression.cjs verified '320,390,768,1000,1440,1920' OUTPUT`

Для 27 desktop snapshots: compare.py с `--screens composer,skills,rating,course,lesson,projects-grid,members-grid,news-modal,competition-empty`.
Прежние visual.cjs (обычный + details) и layout-regression.cjs запускаются без изменения API harness.

## Not checked / rollout

Физические iOS/Android, Safari/WebKit, реальная клавиатура и live API в этой сессии не проверялись.
Pixel gate покрывает выбранные состояния, а не все страницы/данные приложения.
После merge на устройстве проверить публикацию новости, выбор/сброс кейса, длинные навыки,
scroll номеров урока, две колонки карточек и открытие подсказки конкурса.
Миграции и backend rollout не требуются. Merge/deploy выполняет пользователь.
