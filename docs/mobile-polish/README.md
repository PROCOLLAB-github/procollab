<!-- @format -->

# Исправления мобильной компоновки после PR #401

## Направление и критерии до реализации

Запрос пользователя: устранить 12 проблем на приложенных mobile screenshots. Режим: исправление существующего интерфейса PROCOLLAB. Mont, семантические tokens, текущие иконки, роли, API и бизнес-действия сохраняются. Светлая нейтральная шапка с тёмными иконками явно выбрана пользователем. Существующие ListPage, DetailPage, ProjectList и ParticipantList остаются основой.

Источники качества: `procollab-design-system-v1/docs/design-quality/mobile.md`, `antislop.md`, `patterns.md`, текущие shared-компоненты и screenshots пользователя. Применяются читаемость, группировка, компактная плотность и отсутствие декоративного пересечения иконок/текста. Внешние правила лендингов, шрифтов, иконок Fill и Figma не переносятся в runtime. Порядок блока «Моя активность» меняется по явному пункту 6 пользователя. Новая продуктовая функция и перенос в Figma не входят в задачу.

| AC  | Исправление                                     | Приёмка                                                                                   |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Заголовок шапки соответствует текущему маршруту | Новости/Профиль не наследуют «Программы», в том числе при переходе внутри приложения      |
| 2   | Категории новостей без выступающих иконок       | Иконка, название и счётчик в потоке, без пересечения                                      |
| 3   | Удалён дублирующий «Фильтр» ленты               | Один набор категорий; выбор меняет прежний query/filter и active state                    |
| 4   | Полные названия навыков                         | Перенос строк; дополнительные навыки раскрываются доступной кнопкой                       |
| 5   | Компактные карточки проектов                    | На mobile ширина не растягивается на всю страницу, CTA ≥44 px и внутри карточки           |
| 6   | «Моя активность» выше списка                    | Полноценный summary по ширине контейнера, метрики 2×2, desktop sidebar сохранён           |
| 7   | Компактные карточки участников                  | Ограниченная ширина, читаемые имя/специальность/навык, CTA по содержимому                 |
| 8   | Программа: география читается полностью         | Даты и «для всей России» отдельными строками, без clipping                                |
| 9   | Понятные действия программы                     | Название программы, явно подписанные «Контакты» и «Положение», аккуратная группа действий |
| 10  | Действия профиля сгруппированы                  | Ровная сетка, без пустых разделителей и разнесённых по краям одиночных кнопок             |
| 11  | Действия и metadata проекта                     | Общая сетка действий; metadata занимает всю доступную ширину mobile                       |
| 12  | Спокойная шапка с центром                       | Светлый фон, тёмные иконки, центр заголовка совпадает с центром viewport, цели ≥44 px     |

Проверка: 320/360/390/430/768/1440 px, обычный и длинный русский контент, before/after screenshots, переходы внутри приложения, категории и раскрытие навыков, keyboard/focus, применимые loading/disabled/validation состояния. Геометрия не заменяет ручной просмотр всех затронутых экранов. Реальные iOS/Android на dev по-прежнему требуют доступа к устройствам и стенду.

## Итоговая реализация

Светлая шапка использует существующий surface token и симметричные боковые зоны. Заголовок определяется текущим маршрутом при прямом открытии и SPA-переходах, поэтому поздний ответ программы не подменяет «Новости»/«Профиль». Выход доступен в мобильном drawer; уведомления и аватар имеют native controls с областью нажатия ≥44 px.

В ленте остался один работающий набор категорий. Иконка, название и счётчик расположены в потоке. Навыки вакансии используют `VacancySkills` с полными подписями и раскрытием остальных. Проекты и участники используют общий token ширины 260 px до desktop breakpoint; списки размещают столько компактных карточек, сколько помещается. Активность показана над списком, метаданные проекта занимают всю ширину mobile.

Общий `Detail` показывает название и существующую обложку, выравнивает secondary actions в две колонки, убирает пустые divider cells и подписывает «Контакты»/«Положение». Primary action программы расположен первым. В карточке программы даты и география разделены; registration state и его приоритет сохранены. При проверке дополнительно исправлена область пустого snackbar, которая перехватывала клик по аватару на tablet.

Изменены shared-компоненты: `FeedFilter`, `InfoCard`, `VacancySkills`, `Detail`, `ProfileControlPanel`, `ProfileInfo`; shared стили `feed-card`, `ui-tokens`. На страницах изменены `Nav`/`Office`/`Snackbar`, `ProjectActivityCard`, `ProjectsLeftSide`, `ProgramCard`, `MemberCard`, сетки проектов/участников и отступы ленты. Mont, текущие иконки, Button/Card/PageHeader и UIKit adapters сохраняются.

**Бизнес-логика не менялась.** Нет diff в API/domain/infrastructure, routes, permissions, payloads, dependencies или backend. Категории вызывают прежний `FeedFilterInfoService.setFilter`; навыки раскрывает существующий widget; logout вызывает прежний `Office.onLogout`. Условия ролей, сроки регистрации, status precedence, команды, заявки и отправка решений сохранены. Изменения TypeScript ограничены UI title/output/imports и удалением неиспользуемого dropdown UI.

## Проверки и evidence

Среда: Windows, headless Chrome/Playwright, production Angular build, локальный preview, синтетический API. Запросы и мутации не уходят на реальный сервер. В fixtures есть заведомо длинные строки и неполные данные; изображения/имена в evidence не являются реальными данными dev.

| Проверка                                       | Результат                                                                                               | Evidence                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Unit/regression suite                          | 2006 tests / 406 files PASS                                                                             | [tests.log](tests.log)                                                       |
| Повтор после последней правки шаблона названия | 41 InfoCard tests PASS                                                                                  | [info-card-tests.log](info-card-tests.log)                                   |
| Production build                               | PASS; существующие template/CommonJS warnings                                                           | [build.log](build.log)                                                       |
| ESLint                                         | 0 errors, 6 существующих warnings                                                                       | [lint.log](lint.log)                                                         |
| Stylelint изменённых SCSS                      | PASS                                                                                                    | [styles.log](styles.log)                                                     |
| Prettier, весь repo, Windows end-of-line auto  | PASS                                                                                                    | [format-all.log](format-all.log)                                             |
| Геометрия и console errors                     | 48 экранов на 320/360/390/430/768/1440 px PASS                                                          | [after.json](after.json), [browser-check.cjs](browser-check.cjs)             |
| Поведение и touch targets                      | 18 сценариев на 320/390/768 px PASS; SPA title, query/API filter, skill expansion, layout, Escape/focus | [interactions.json](interactions.json), [interactions.cjs](interactions.cjs) |
| Разделы и состояния                            | 48 проверок на 320/390/1440 px PASS; проекты, вакансии, программы, курсы, профиль/edit, onboarding      | [states.json](states.json), [state-check.cjs](state-check.cjs)               |

Проверка состояний включает задержку ответа и блокировку повторной отправки, empty list, injected HTTP 500 и рабочий retry, disabled button/filter без запроса, validation регистрации/onboarding без мутации. Ожидаемые ошибки injected HTTP 500 отдельно отмечены в JSON. Before screenshots сняты с merged dev `ec57fa7c` до пересборки изменённых исходников; результат: [before.json](before.json).

| Экран, 390 px      | До                                               | После                                          |
| ------------------ | ------------------------------------------------ | ---------------------------------------------- |
| Новости            | [before](screenshots/before/feed-390.png)        | [after](screenshots/after/feed-390.png)        |
| Dashboard проектов | [before](screenshots/before/projects-390.png)    | [after](screenshots/after/projects-390.png)    |
| Мои проекты        | [before](screenshots/before/my-projects-390.png) | [after](screenshots/after/my-projects-390.png) |
| Участники          | [before](screenshots/before/members-390.png)     | [after](screenshots/after/members-390.png)     |
| Программы          | [before](screenshots/before/programs-390.png)    | [after](screenshots/after/programs-390.png)    |
| Программа          | [before](screenshots/before/program-390.png)     | [after](screenshots/after/program-390.png)     |
| Профиль            | [before](screenshots/before/profile-390.png)     | [after](screenshots/after/profile-390.png)     |
| Проект             | [before](screenshots/before/project-390.png)     | [after](screenshots/after/project-390.png)     |

## Ограничения и следующий этап

Все 12 пунктов пользователя проверены исходниками, в браузере и визуально; [requirement audit](review.md). Автоматическая геометрия дополнена просмотром ключевых mobile screens, desktop и снимков состояний. Скриншоты, JSON и logs свёрнуты в GitHub diff через `.gitattributes`.

**Not checked:** физические iOS Safari / Android Chrome на dev, реальные аккаунты и screen reader. Browser emulation не подтверждает эти среды и не заменяет запрошенный smoke-test. После merge этого отдельного fix PR нужен smoke-test на dev до prod: открыть все ключевые разделы, выполнить SPA navigation, фильтрацию/раскрытие навыков, проверить drawer/notifications, keyboard в формах и роли программы. Найденные на устройствах проблемы исправлять отдельными PR. Production merge/deploy в эту задачу не входят.

API/data migration не требуются. Визуальные изменения shared компонентов распространяются на их consumers; поэтому перепроверены связанные разделы и состояния. Текущая палитра не объявляется полностью WCAG AA compliant.
