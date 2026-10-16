<!-- @format -->

# Восстановление desktop после #401

Desktop ≥1000 px возвращён к визуальному состоянию `dev` до merge #401.
Mobile/tablet <1000 px сохраняет адаптив и исправления мобильной компоновки из #403.
Новый desktop-дизайн в эту задачу не входит.

- Desktop-эталон: `5fe4d5c6db435488fffa688d0fa6bd713d6eb7a0` — первый родитель merge
  `ec57fa7cadb8ca7acef6859380a966a837783495` (#401).
- Mobile-эталон: `1138fe0cad35a90551be8451b2b2df0d24aacd8f` — мобильные исправления #403 до восстановления desktop.
- [Viewer](comparison.html), [desktop JSON](comparison-desktop-after.json),
  [mobile JSON](comparison-mobile-after.json), [requirement audit](review.md).

## Acceptance criteria

1. Desktop сохраняет прежние layout, композицию, Mont, размеры, отступы и расположение действий.
2. Office, Feed/FeedFilter, проекты/InfoCard, Programs/ProgramCard, Detail профиля/проекта/программы,
   Members, Vacancies, Courses, PageHeader и shared Button/Card проверены на 1440 и 1920 px.
3. **Pixel/visual regression — обязательный gate.** Размеры снимков и все RGB-пиксели должны совпадать.
   Нет масок и разрешённых исключений. `compare.py --check` возвращает ошибку при любом отличии.
   Дополнительная метрика `changedPixels` с допуском 8/255 помогает анализировать diff;
   решение PASS использует строгую метрику `exactChangedPixels == 0`.
4. Mobile/tablet сохраняется на 320, 390 и 768 px; проверяются состояния и взаимодействия.
5. API, permissions, payloads, маршруты, бизнес-правила и зависимости сохраняются.

## Результаты

| Проверка                                                             | Результат                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Повторный снимок desktop-эталона                                     | 36/36, **0 отличающихся пикселей**                                 |
| Desktop до #401 vs исправление, 1440/1920                            | 36/36, **0 отличающихся пикселей**                                 |
| Mobile до восстановления desktop vs исправление, 320/390/768         | 42/42, **0 отличающихся пикселей**                                 |
| Loading, empty, error/retry, disabled, validation и основные разделы | 48 mobile state checks                                             |
| Навигация, фильтры, навыки, карточки, активность и действия Detail   | 18 mobile сценариев                                                |
| Переход 390 → 1000 → 768 → 390                                       | 6 checks: DOM routed roots, поиск и query фильтра сохраняются      |
| Unit tests                                                           | 2006 tests / 406 files; 3 существующих исключения runner сохранены |
| Production build                                                     | Успешно, бюджеты не увеличены                                      |
| TypeScript lint                                                      | 0 errors, 6 существующих warnings                                  |

14 обычных экранов × 2 desktop-ширины + 3 empty-состояния × 2 ширины + loading action × 2 ширины = 36 пар.
Mobile: 14 экранов × 3 ширины = 42 пары.

Экраны: Feed/Office/FeedFilter, Projects dashboard, My projects, Members, Programs, Program Detail,
Profile Detail, Project Detail, Vacancies, Vacancy Detail, Courses, Course Detail,
Profile editor, Project editor. Desktop states: empty Feed, Vacancies, Courses и loading action урока.
Все пары доступны в [viewer](comparison.html) и каталогах screenshots/desktop-before,
screenshots/desktop-after, screenshots/mobile-before, screenshots/mobile-after.

## Реализация и shared компоненты

Новые responsive/UI Kit правила ограничены `<1000px`. Для desktop восстановлены прежние
consumer styles и нужные фрагменты разметки. Общие `.ui-card`, `.ui-form`, `.ui-filters`,
`.ui-field` и остальные адаптеры на desktop не задают новую геометрию.
Нативные кнопки имеют нейтральный reset с нулевой specificity; размеры задают прежние consumers.

`DesktopLayoutService` задаёт одну presentation-границу. Корни страниц, router outlets,
поиск и формы сохраняются при изменении ширины; переключаются presentation-фрагменты.
Desktop Avatar в social platform использует прежнюю рамку/обёртку, наследуя input API canonical Avatar.
Стили полей сохраняют исходный порядок CSS: отступы модификаторов не перекрываются media-блоком.

- `@uilib`: Button, Icon, Avatar, Loader, Badge, Back, PageHeader, ProfileControlPanel, Tabs;
  DesktopLayoutService. Card/Field/Form/Filters/Drawer/Dialog/Alert adapters — scoped stylesheet.
- Social primitives: Avatar compatibility adapter, Bar, Input, Select, Textarea, AutocompleteInput,
  Search, Checkbox, Dropdown, FileItem, Modal, Switch, Tag, UploadFile.
- Shared widgets: Detail, FeedFilter, InfoCard, VacancySkills/Status, ProjectsFilter/VacancyFilter,
  ProjectInviteDialog, ProjectVacancyCard/VacancyCard, News components, RegionSelect,
  SkillsGroup/SpecializationsGroup; общие typography/feed/vacancy/responsive mixins.
- Step navigation проекта/профиля: прежняя desktop-разметка и мобильный Tabs ниже 1000 px.

## Воспроизведение

Нужны те же установленные зависимости, Playwright, Chrome, Python с Pillow и NumPy.
`PLAYWRIGHT_MODULE` и `CHROME_PATH` указывают на установленный модуль и браузер.

Собрать production из desktop-эталона, mobile-эталона и текущей ветки в отдельных каталогах.
Раздавать их через `node docs/desktop-regression/serve.cjs <dist-root> <port>`:
desktop reference — 4431, mobile reference — 4432, исправление — 4433.
Для state/interaction/resize scripts раздать исправление также на 4360.

```powershell
node docs/desktop-regression/capture.cjs desktop-before http://localhost:4431
node docs/desktop-regression/capture.cjs desktop-repeat http://localhost:4431
node docs/desktop-regression/capture.cjs desktop-after http://localhost:4433
# Повторить для всех трёх desktop фаз:
node docs/desktop-regression/capture.cjs desktop-before http://localhost:4431 1440,1920 edit
node docs/desktop-regression/capture-states.cjs desktop-before http://localhost:4431
node docs/desktop-regression/capture-loading.cjs desktop-before http://localhost:4431
node docs/desktop-regression/capture.cjs mobile-before http://localhost:4432 320,390,768
node docs/desktop-regression/capture.cjs mobile-after http://localhost:4433 320,390,768
# Повторить для обеих mobile фаз:
node docs/desktop-regression/capture.cjs mobile-before http://localhost:4432 320,390,768 edit
python docs/desktop-regression/compare.py desktop-before desktop-repeat --check
python docs/desktop-regression/compare.py desktop-before desktop-after --check
python docs/desktop-regression/compare.py mobile-before mobile-after --check
node docs/desktop-regression/states.cjs
node docs/desktop-regression/interactions.cjs
node docs/desktop-regression/resize.cjs
npm run test:ci
npm run build:social:prod
npm run lint:ts
```

Синтетические API fixtures одинаковы для каждой пары, clock фиксирован, Mont загружен,
animations/transitions отключены, браузер и device scale одинаковые. API запросы перехватываются;
реальный backend не изменяется. Повтор эталона проверяет детерминизм.

Снимки показывают видимую композицию при высоте viewport 844 px. Office использует внутренний
scroll; `fullPage` не означает снимок всех скрытых областей scroll-контейнера. Динамический backend,
все роли и все возможные данные этим набором не исчерпываются.

Реальные iOS/Android на dev-стенде **не проверены**: нет доступа к физическим устройствам.
После merge требуется device smoke-test перед prod; найденные проблемы — отдельными PR.
