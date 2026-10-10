<!-- @format -->

# Исправления мобильного production после #407

Base: `master`, production `19439e6d359d37ae1bca4a0d7d4b57d4337869fc`.
Ветка `fix/prod-mobile-layout-20261010` создана от этой revision. Другие изменения dev не включены.

## Требования

| Критерий        | Ожидаемый результат                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Desktop         | Pixel comparison с текущим production: 1000, 1440, 1920px, без масок и допуска                                 |
| Mobile/tablet   | 320, 390, 768px: без overflow, наложений и переноса иконок под текст кнопки                                    |
| Уведомления     | Колокольчик показывает панель в viewport; пустое состояние и список, прочитать все, закрытие Escape/вне панели |
| Программы       | Одна рамка карточки, аватар отдельно от заголовка; organizer-only и participant-only варианты кнопок           |
| Профиль/проект  | Аватар и имя по центру; описание/навыки/цели, затем основные данные/команда/опыт/контакты, затем новости       |
| Новости/проекты | Иконки внутри фильтров; плюс рядом с подписью; описание карточки ограничено целыми строками                    |
| Вакансии        | Один контур бейджа; поиск и фильтры перед результатами, включая DOM order                                      |
| Редакторы       | Сохранение на всю ширину рабочей строки; back отдельно; безопасный перенос длинного текста с иконкой           |

## Реализация

Все геометрические изменения SCSS ограничены `max-width: 999px`.
У shared Button исправлен селектор существующего единственного projection slot `.button__label`.
Desktop loading/projection и DOM кнопки не менялись.
Панель уведомлений была `position: fixed; top: 100%`: открывалась за нижним краем viewport.
Она теперь располагается под шапкой; production handlers, endpoints и permissions сохранены.

У ProgramCard сняты унаследованные отрицательный margin, padding и внутренняя рамка.
FeedFilter больше не наследует desktop transform круглой иконки.
В VacancyStatus внешний host не рисует вторую рамку поверх shared Badge.
InfoCard больше не сохраняет фиксированный `flex-basis` в 24px при мобильном межстрочном 18px.
Описание занимает до трёх целых строк с ellipsis; полное описание доступно в проекте.

Для профиля и проекта mobile DOM отличается по порядку блоков, desktop siblings сохранены.
Основные данные и дополнительные сведения проецируются перед новостями через единственный slot,
без второго экземпляра центрального компонента и повторной загрузки его facade.
Карточки направлений на mobile стоят в две колонки с читаемыми подписями.
В редакторе проекта удаление располагается после действий сохранения; unit-тесты выбирают
сохранение по варианту кнопки, а не по прежнему индексу элемента.

Неоднозначный пункт «в чат с аналитикой» трактован как оформление виджета участника:
увеличены межстрочные интервалы, подписи этапов и маркеры. Новые чаты, роли, API и правила подачи не добавлены.

## Проверки и воспроизведение

- Production build: exit 0, budgets сохранены.
- `npm run test:ci`: **2099/2099**, 413 файлов, exit 0.
- ESLint: 0 errors, 6 существующих unused-disable warnings.
- Stylelint: 17 изменённых SCSS, exit 0.
- Desktop: [66/66 основных состояний](./desktop-comparison.json) и
  [16/16 дополнительных состояний](./desktop-role-comparison.json), **0 отличающихся RGB pixels**.
- Mobile: [viewport/композиция](./viewport-checks.json), [состояния полей и модальных окон](./detail-checks.json),
  [раздельные роли, кнопки и уведомления](./mobile-layout.json). 320/390/768px, assertions passed.
- Репрезентативные снимки: [программы](./screenshots/programs-390.png),
  [участник](./screenshots/participant-390.png), [уведомления](./screenshots/notifications-loaded-390.png),
  [проекты](./screenshots/projects-390.png), [вакансии](./screenshots/vacancies-390.png),
  [профиль](./screenshots/profile-edit-390.png), [достижения](./screenshots/achievements-390.png).

Browser: headless Chromium/Chrome, production Angular build, только synthetic API/WS fixtures.
Baseline и результат используют одинаковые данные, fonts, assets и отключённые анимации.
Новые сценарии не смешивают manager/expert/member одновременно.

Основная матрица включает длинное описание программы. Дополнительные role/action fixtures
используют короткое описание: старый production `AfterViewInit` иногда захватывает описание
до создания элемента, из-за чего «подробнее» появляется нестабильно. Этот код в PR не менялся.
Role/action matrix проверяется также трижды на 1920px с равенством повторных PNG bytes.

```powershell
$env:PLAYWRIGHT_MODULE = '<absolute path to playwright>'
$env:CHROME_PATH = '<absolute path to Chrome>'
$env:QA_BUILD_ROOT = '<production baseline build>'
node docs/mobile-production/visual.cjs baseline http://127.0.0.1:4471 '1000,1440,1920' <screenshots>
node docs/mobile-production/visual.cjs baseline http://127.0.0.1:4471 '1000,1440,1920' <screenshots> details
node docs/mobile-production/layout-regression.cjs baseline '1440,1920' <layout>
$env:QA_BUILD_ROOT = 'dist/social_platform'
node docs/mobile-production/visual.cjs verified http://127.0.0.1:4472 '320,390,768,1000,1440,1920' <screenshots>
node docs/mobile-production/visual.cjs verified http://127.0.0.1:4472 '320,390,768,1000,1440,1920' <screenshots> details
node docs/mobile-production/layout-regression.cjs verified '320,390,768,1440,1920' <layout>
python docs/mobile-production/compare.py <screenshots>/baseline <screenshots>/verified <report.json>
```

`preview.cjs` отклоняет пустой SVG sprite. Windows CLI `svg-sprite` с Unix glob может создать
пустой файл: для QA восстановлен tracked production sprite и скопирован в оба build assets.
JavaScript/CSS bundles не изменялись. Сгенерированный пустой source sprite в PR не включён.

Статические проверки: production build, полный Vitest, ESLint, Stylelint изменённых SCSS,
`npm run format:check` на полном Git index с LF (как в Linux CI).

Физические iOS/Android и Safari/WebKit не проверены; live backend данные не использовались.
Этот PR предназначен для `master`; merge/deploy остаётся отдельным действием.
