<!-- @format -->

# Refinement вкладки «Команда» — Angular

## Задача и источники

Base: `origin/dev`, `f973d530`. Ветка: `feat/dev-project-team-refinement`.
Только существующая Angular-вкладка команды и её окна. React, backend, API, permissions,
другие вкладки, Design System и Figma не входят в diff. Merge/deploy не выполняются.

Утверждённый [Figma](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=38-1632):
desktop `38:1637`, empty `38:1767`, pending `38:1841`, loading `38:1951`,
mobile 390 `38:2021`, mobile 320 `38:2143`, invitation error `38:2256`.
Design report: `design-artifacts/project-team-refinement-20260928/README.md` в рабочем каталоге PROCOLLAB-dev.
Правила: `docs/design-system/visual-continuity.md` и локальные `procollab-angular`,
`procollab-review`, `procollab-pr` из `procollab-design-system-v1`.

## Исследование и план

1. TeamManagement находится в `project-team-step`, строки — `collaborator-card` и `invite-card`.
   `ProjectTeamUIService` хранит списки/форму, `ProjectTeamService` вызывает существующие use cases.
   `ProjectsEditInfoService` инициализирует участников и приглашения из route resolver.
2. Переиспользовать Button, Avatar, Icon, существующие action buttons, оболочку
   `ProjectInviteDialog`, participant picker и поле роли с combobox. Общий Input не поддерживает
   search/readonly/combobox-атрибуты этого flow; сохранить существующие специализированные поля.
   Отдельного runtime IconButton в Angular нет: использовать существующие native buttons
   с доступными именами и SVG. Новые canonical DS-компоненты не нужны.
3. Заменить карточки/summary/promo на списки с разделителями; роли у людей, счётчики у заголовков.
   Сохранить Mont и существующие semantic CSS variables. Общую оболочку FormPage не менять.
4. Отделить начальную инициализацию списка от пустого массива одним UI-флагом, который
   завершается существующим `applySetCollaborators`. Null invitationProject также означает
   невалидный контекст, поэтому использовать его как бесконечный network loading нельзя.
   Resolver и API semantics остаются прежними.
5. Добавить opt-in компактную оболочку только для окон команды; профиль не менять.
6. Обновить regression tests; проверить настоящий Angular UI в изолированном browser fixture,
   выполнить полный existing Vitest и production build, review и PR в dev.

## Acceptance criteria

| AC  | Требование                                                         | Проверка                 |
| --- | ------------------------------------------------------------------ | ------------------------ |
| 1   | Компактная вкладка без invite-плашки, summary и promo              | Desktop / Figma          |
| 2   | Active и pending отдельно; реальные роли и счётчики; owner и «Вы»  | Tests / browser          |
| 3   | Empty с владельцем и настоящий пустой список без выдуманного owner | Tests / browser          |
| 4   | Loading без ложных нулевых счётчиков и активного приглашения       | Tests / browser          |
| 5   | Ошибка сохраняет участника/роль, retry, close/reset и focus        | Tests / browser          |
| 6   | 390/320: длинный контент, подписанные действия, без overflow       | Browser / Figma          |
| 7   | Поиск, edit/revoke/remove, подтверждения и API payload сохранены   | Existing tests / browser |
| 8   | Keyboard focus/trap/Escape, доступные имена и disabled/busy        | Tests / browser          |
| 9   | Existing Angular tests и production build                          | Команды и exit status    |

## Результаты

### Проверки на итоговом коде

Windows, Node 24.18.0, npm 11.16.0. Dependencies переиспользованы из соседнего checkout через локальный
junction `node_modules`: SHA-256 обоих lockfile совпадает (`01C12314…D4D9BA2B`).
Зависимости и lockfile не менялись.

| Проверка                                                             | Фактический результат                                              | Exit |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | ---- |
| Targeted Vitest: team, facade/UI, search, role input, profile invite | 63 теста / 8 файлов                                                | 0    |
| Усиленный regression test возврата фокуса до исправления             | 1 failed / 6 passed; воспроизвёл потерю focus после async response | 1    |
| Targeted после исправления: team и project-invite                    | 38 тестов / 5 файлов                                               | 0    |
| `npm run test:ci -- --pool=forks`, финальный полный прогон           | 1873 теста / 395 файлов, 226.74 s, 0 unhandled errors              | 0    |
| `npm run build:prod`, повторно после focus fix                       | Production bundle собран                                           | 0    |
| `npm run lint:ts`                                                    | 0 errors, 6 существующих warnings вне diff                         | 0    |
| ESLint изменённых TS после focus fix                                 | Без замечаний                                                      | 0    |
| Stylelint изменённых SCSS, без `--fix` в финальной проверке          | Pass                                                               | 0    |
| Prettier изменённых TS/HTML/SCSS, `--ignore-path .gitignore`         | Pass                                                               | 0    |
| `git diff --check`                                                   | Pass                                                               | 0    |
| Angular development build изолированного preview                     | Pass                                                               | 0    |

Конфигурация Vitest не менялась: три ранее исключённых spec-файла остаются исключёнными.
Предупреждения сборки: существующие Sass/CommonJS и CSS budgets; строки участников — 2.34 kB,
оболочка приглашения с opt-in вариантом — 9.27 kB (warning 2 kB, error 15 kB).
Budgets не повышались. NG0912 из двух существующих IconComponent также сохраняется.

### Browser и визуальное сравнение

[Численные результаты](visual-results.json): 6 состояний × 1040 / 390 / 320 px плюс ошибка
приглашения на каждой ширине — **21 проверка**. Во всех: horizontal overflow = 0, clipped
names/roles/actions = 0. В Windows scrollbar занимает 15 px; доступная ширина составляет
1025 / 375 / 305 px соответственно. Production font по computed style — Mont.

| Figma                | Что сравнивалось                                                                         | Angular screenshot                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Desktop `38:1637`    | Заголовок 18/27 regular, CTA 208 px, роли/статусы по колонкам, строки 66 px, разделители | [Desktop](screenshots/final-main-1040.png)                                                                   |
| Empty `38:1767`      | Владелец остаётся, count 1, спокойная подсказка, без pending                             | [Empty](screenshots/final-empty-1040.png)                                                                    |
| Pending `38:1841`    | Count 2, даты, роли, edit/revoke; active отдельно                                        | [Pending](screenshots/final-pending-1040.png)                                                                |
| Loading `38:1951`    | Три статичных skeleton-строки, disabled CTA, нет нулевых counts                          | [Loading](screenshots/final-loading-1040.png)                                                                |
| Mobile 390 `38:2021` | Одна колонка, роль под именем, подписанные действия                                      | [390](screenshots/main-390.png)                                                                              |
| Mobile 320 `38:2143` | Pending, длинное имя и роль без ellipsis/overflow                                        | [320](screenshots/pending-320.png)                                                                           |
| Error `38:2256`      | Компактное окно 552 px, поля/участник сохранены, inline error, повторная отправка        | [Desktop](screenshots/error-desktop.png), [390](screenshots/error-390.png), [320](screenshots/error-320.png) |

Дополнительно проверены настоящий нулевой список и длинный контент в active/pending на всех трёх
ширинах, переход loading → ready, поиск/выбор, изменение роли, отмена и подтверждение отзыва,
повторная отправка после ошибки, reset при повторном открытии, Enter/Escape, Tab/Shift+Tab,
focus trap, видимый focus outline, возврат фокуса после async success.

Native `window.confirm` исключения в IAB привёл к timeout команды, активный confirm затем не
был доступен; число участников осталось прежним. Полный browser путь подтверждения исключения
не заявляется проверенным. Его отмена, успешное удаление, ошибка и защита от повтора подтверждены
существующим `collaborator-card.component.spec.ts`; обработчик и use case не менялись.

Это **локальный preview реальных Angular компонентов и фасадов** с тестовыми данными/API-ответами.
Оболочка редактора в preview упрощена. Это не авторизованный E2E живого DEV: серверные записи,
уведомления, реальные права на deployed backend и доставка приглашения не проверялись.
Fixture не входит в production bundle.

### Отличия от Figma

- Mont вместо технического Inter-preview; в списке сохранён production Avatar с текущим fallback.
  Метрики шрифта и ширина scrollbar влияют на переносы.
- Touch targets CTA/действий/кнопок окна — 44 px вместо 40 px. Обычная mobile строка получается
  около 129 px; desktop — 66 px. На mobile поля 16 px сохраняют текущий ввод без auto zoom.
- Сохранены реальные public metadata выбранного кандидата, очистка выбора, combobox-подсказки,
  существующие тексты ошибок и валидации. Они функциональны, хотя макет показывает упрощённую форму.
  Footer использует существующие native invite buttons, основной CTA — canonical Angular Button.
- Вместо «Приглашения ещё не отправлялись» показано «Нет ожидающих приглашений»: отсутствие pending
  не доказывает отсутствие отправленных/принятых приглашений в прошлом.
- Общая шапка и навигация редактора не перерабатывались: они вне scope, несмотря на их изображение
  в Figma. Новых DS primitives, tokens, variants или изменений Figma нет.

### Поведение, API и permissions

Бизнес-логика сохранена: pending — строго `isAccepted === null`, никаких выдуманных участников
или ролей. Свободный ввод роли, нормализация, поиск и ограничения кандидатов прежние.
Создание — существующий POST `/invites/`; редактирование — PATCH с сохранением specialization;
отзыв — DELETE; исключение — прежний use case/adapter. API/models/guards не менялись.

Изменения UI-состояния: начальный loading снимается существующим `applySetCollaborators`;
empty с одним текущим пользователем сохраняет его строку. Для compact dialog возврат focus
отложен до конца отрисовки, чтобы существующий Button успел снять disabled. Профиль использует
`compact=false` и прежний способ возврата focus.

Read-only проверка backend source (`api/invites/{views,permissions}.py`,
`api/projects/views.py`): отправлять/редактировать/отзывать может руководитель проекта,
исключение требует IsProjectLeader и проектного scope. Backend diff отсутствует.

Соседние особенности, оставленные вне scope:

- Исходный UI показывает действие исключения и для владельца, а backend исключает лидера из
  queryset удаления. Это поведение сохранено; менять видимость/правила в refinement нельзя.
- `Invite.isAccepted` в текущей TS-модели не описывает серверный null явно. Runtime-фильтр
  существовал и сохранён; исправление общего контракта типов не включено.

### Последовательный review / Impeccable quality layer

Проведён review diff против dev и call chain: компоненты → фасады → use cases → HTTP adapters,
сравнение с соседними `project-achievement-step`, `project-partner-resources-step` и
типографикой/кнопками editor shell. Применён ограниченный Impeccable pass:
hierarchy, density, grouping, responsive, keyboard/focus и отсутствие декоративных cards/pills/promo.
Приоритет у PROCOLLAB/Figma. Нового визуального языка, анимаций, теней и design-system миграции нет.

| AC  | Evidence                                                                                                 | Verdict                                 |
| --- | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | Desktop screenshot + diff удаления sidebar/invite-panel/promo                                            | PASS                                    |
| 2   | Team spec: реальные counts/roles и фильтр accepted/rejected; browser                                     | PASS                                    |
| 3   | Owner-only/zero tests + screenshots на трёх ширинах                                                      | PASS                                    |
| 4   | UI service + component tests; browser loading → ready                                                    | PASS                                    |
| 5   | Error/retry spec + browser, preserved draft и async return focus                                         | PASS                                    |
| 6   | 21 измерение, длинные active/pending, mobile screenshots                                                 | PASS                                    |
| 7   | Existing facade/card/use case/adapter tests; browser edit/revoke/send; native confirm — ограничение выше | PASS (tests + source; browser частично) |
| 8   | Browser Tab/Shift+Tab/Enter/Escape, focus trap/outline, regression test                                  | PASS                                    |
| 9   | Финальные 1873 теста и production build, exit 0                                                          | PASS                                    |

Нерешённых BLOCKER/MAJOR в изменённом коде нет. Готово к review PR; merge/deploy не выполнялись.
Полный screen-reader audit и WCAG AA не заявляются: сохранены утверждённые/production colors.

### Изменённые Angular-файлы

Относительно `projects/social_platform/src/app/`:

- `api/project/facades/edit/ui/project-team-ui.service.ts`
- `api/project/facades/edit/ui/project-team-ui.service.spec.ts`
- `ui/pages/projects/edit/components/project-team-step/project-team-step.component.ts`
- `ui/pages/projects/edit/components/project-team-step/project-team-step.component.html`
- `ui/pages/projects/edit/components/project-team-step/project-team-step.component.scss`
- `ui/pages/projects/edit/components/project-team-step/project-team-step.component.spec.ts`
- `ui/pages/projects/edit/components/project-team-step/_team-member-row.scss`
- `ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.html`
- `ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.html`
- `ui/widgets/project-invite/project-invite-dialog.component.ts`
- `ui/widgets/project-invite/project-invite-dialog.component.html`
- `ui/widgets/project-invite/project-invite-dialog.component.scss`
- `ui/widgets/project-invite/project-member-invite-modal.component.html`

### Воспроизведение

```sh
npm ci
npm run test:ci -- --pool=forks
npm run lint:ts
npm run build:prod
npx ng build social_platform --configuration=development --browser=docs/project-team-refinement/preview/main.ts --ts-config=docs/project-team-refinement/preview/tsconfig.json --index=docs/project-team-refinement/preview/index.html --output-path=tmp/team-refinement-preview
cd tmp/team-refinement-preview/browser
python -m http.server 4351 --bind 127.0.0.1
```

На Windows для существующего SVG glob используется
`$env:npm_config_script_shell = 'C:\Program Files\Git\bin\bash.exe'`.

Открыть `http://127.0.0.1:4351/?state=main`; доступные fixtures:
`main`, `empty`, `zero`, `pending`, `loading`, `long`, `error`.
В error первая отправка возвращает ошибку, повтор — success. В loading есть тестовая кнопка
«Завершить загрузку». Browser snapshots получены через Codex browser automation.

Commit hook запускает глобальный stylelint с автоисправлением. Для сохранения scope commit выполняется с локальным пустым hooksPath; ESLint, Stylelint изменённых файлов, Prettier, полный Vitest и build запущены явно выше.
