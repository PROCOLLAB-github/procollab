<!-- @format -->

# Команда проекта и поиск проектов в приглашении

Base: актуальный legacy Angular `dev`, SHA `7f6a79347500db0140f2ef57e1dd381b578ab653`.
Ветка: `feature/dev-project-team-redesign`. Exact head указан в описании Draft PR.
Merge/deploy не выполнялись.

## Команда

- Две колонки: основной контент и «О команде» с метриками, фактическими ролями и подсказкой.
- Заметный блок приглашения и CTA высотой 48 px. Открывается существующая модалка поиска участника для текущего проекта.
- Участники и pending-приглашения разделены. Pending — строго `isAccepted === null`; принятые и отклонённые приглашения не входят в счётчик ожидающих.
- Карточки показывают аватар, полное имя без искусственной обрезки, роль, статус и доступные действия. Текущий пользователь отмечен «Вы», руководитель — по существующему `Project.leader`.
- Дата отправки берётся из `datetimeCreated`; для отсутствующей/некорректной даты показано «Ожидает ответа участника».
- Сайдбар считает реальные записи команды. Роли нормализованы по пробелам/регистру для группировки; показывается число участников с каждой ролью. Нормативы «1/1» и недостающие роли не выдумываются.
- Роль pending-приглашения редактируется существующим PATCH, с сохранением legacy `specialization`. Отзыв остаётся через DELETE с подтверждением. Ошибки явно сообщаются, карточка сохраняется.
- Исключение участника сохраняет существующий use case и подтверждение; повтор во время запроса заблокирован, ошибка видна в карточке.
- Для уже принятых участников рабочий сценарий изменения роли в актуальном фронте отсутствует (ранее была неактивная иконка). Новый API и фиктивное действие не добавлены.
- На tablet сайдбар ниже списка, на mobile — одна колонка. Длинные имена/роли переносятся; действия не перекрывают текст.

Текст приглашения описывает фактический сценарий: «Найдите участника на PROCOLLAB и укажите его роль в проекте». В редакторе проект уже выбран; выбор проекта сохраняется в приглашении из профиля.

## PROFILE PROJECT SEARCH

- **Display-name fallback:** одна функция `getProjectDisplayName()` используется для названия строки, инициала и фильтрации. `null`, `undefined`, пустая строка и пробелы дают «Проект без названия».
- **Partial search:** substring `includes`, в том числе «без», «названия», «без названия», «роект», «назван».
- **Case-insensitive:** существующая frontend-нормализация и `toLocaleLowerCase()`.
- **Whitespace normalization:** trim и collapse повторных пробелов для названия и запроса.
- **Regression tests:** все четыре пустых варианта имени, обычные названия, регистр, пробелы, внутренние подстроки, пустой/безрезультатный поиск, сохранение selectedProjectId при скрытии/возврате строки.

Очистка поиска возвращает весь список и прежнее выделение. Закрытие/повторное открытие сбрасывает состояние по прежней логике. Контракт проектов, модель Project и SendForUserUseCase не менялись.

В локальной оболочке приглашений `vw` заменён на ширину контейнера: вертикальная полоса прокрутки больше не обрезает правый край на узком экране. Общий `app-modal` не менялся.

## Проверки

Среда: Windows, Node 24.18.0; Angular/Vitest и dependencies из неизменённого lockfile.

| Проверка                                           | Результат                                              | Exit |
| -------------------------------------------------- | ------------------------------------------------------ | ---- |
| Targeted Vitest, forks                             | 68 passed / 9 файлов, 0 unhandled errors               | 0    |
| Полный Vitest, forks                               | 1870 passed / 395 файлов, 0 unhandled errors (220.68s) | 0    |
| Production build                                   | pass                                                   | 0    |
| ESLint                                             | 0 errors, 6 существующих warnings вне изменений        | 0    |
| Stylelint изменённых SCSS                          | pass                                                   | 0    |
| Prettier изменённых текстовых файлов, включая SCSS | pass                                                   | 0    |
| git diff --check                                   | pass                                                   | 0    |
| Chrome / Playwright                                | 190 assertions, 19 состояний, 0 page errors            | 0    |

В промежуточном запуске во время правки подписи тест/шаблон были загружены из разных состояний, также возник ngx-autosize teardown error. Финальный полный прогон выполнен на неизменяемом коде без параллельных сборок: 1870/1870, exit 0, без unhandled errors. Shared test harness не менялся.

Сохраняются предупреждения NG0912, Sass/CommonJS и бюджетов сборки. Стили новой вкладки — 3.81 kB, карточек — 2.03 kB: выше warning 2 kB, ниже error 15 kB. Budgets не менялись.
GitHub workflow для pull_request/feature-веток в репозитории нет: имеющиеся workflows запускают deploy при push в dev/master. Они не запускались и не менялись.

## Визуальная проверка

Ширины **1440 / 768 / 390 px**: команда, пустая команда, модалка с выбранным участником. Проверены создание pending, счётчики, изменение роли и сохранение specialization, отмена/подтверждение отзыва, исключение участника и обновление ролей сайдбара.

Профиль `/office/profile/10 → Пригласить`: fixture **4 проекта без имени + 3 с именами**. На **1440 / 390 px** сняты пустой поиск, «без», «названия», часть реального имени и отсутствие результатов. Дополнительно проверены uppercase/лишние пробелы, сохранение выбора и reset при повторном открытии.

Horizontal overflow = **0** во всех 19 состояниях. Проверены границы модалки с учётом доступной ширины, отсутствие наложения действий и расположение сайдбара после основного контента на mobile. [Численные результаты](visual-results.json).

| Состояние                | Desktop                                        | Tablet                                 | Mobile                                       |
| ------------------------ | ---------------------------------------------- | -------------------------------------- | -------------------------------------------- |
| Команда                  | [1440](screenshots/team-1440.png)              | [768](screenshots/team-768.png)        | [390](screenshots/team-390.png)              |
| Пустая команда           | [1440](screenshots/team-empty-1440.png)        | [768](screenshots/team-empty-768.png)  | [390](screenshots/team-empty-390.png)        |
| Приглашение из команды   | [1440](screenshots/team-invite-1440.png)       | [768](screenshots/team-invite-768.png) | [390](screenshots/team-invite-390.png)       |
| Профиль: весь список     | [1440](screenshots/profile-all-1440.png)       | —                                      | [390](screenshots/profile-all-390.png)       |
| Профиль: «без»           | [1440](screenshots/profile-bez-1440.png)       | —                                      | [390](screenshots/profile-bez-390.png)       |
| Профиль: «названия»      | [1440](screenshots/profile-nazvaniya-1440.png) | —                                      | [390](screenshots/profile-nazvaniya-390.png) |
| Профиль: часть имени     | [1440](screenshots/profile-real-1440.png)      | —                                      | [390](screenshots/profile-real-390.png)      |
| Профиль: нет результатов | [1440](screenshots/profile-empty-1440.png)     | —                                      | [390](screenshots/profile-empty-390.png)     |

Это локальный browser preview **реальных ProjectTeamStepComponent и DeatilComponent**, production-шаблонов/стилей и существующих фасадов. Данные/API-ответы и окружающая навигация заданы fixtures. Это не авторизованный E2E на живом DEV: доставка уведомлений и реальная серверная запись не проверялись, реальные приглашения не отправлялись. Preview не входит в production bundle.

## Что сохранено

React и backend не затронуты. Project model, API проектов, SendForUserUseCase, invite permissions, route guards, shared test harness, workflows и зависимости не менялись. Сохранены свободный ввод роли, поиск участников, серверная проверка прав, сценарии отправки и сброса приглашения.

## Воспроизведение

```sh
npm ci
npm run test:ci -- --pool=forks
npm run lint:ts
npm run build:prod
npx ng build social_platform --configuration=development --browser=docs/project-team-redesign/preview/main.ts --ts-config=docs/project-team-redesign/preview/tsconfig.json --index=docs/project-team-redesign/preview/index.html --output-path=tmp/team-preview
```

Запустить `python <absolute-path>/docs/project-team-redesign/preview/serve.py 4346` из `tmp/team-preview/browser`, затем из корня репозитория:

```sh
node docs/project-team-redesign/preview/visual-acceptance.cjs
```

Для Playwright можно указать внешний runtime через `PLAYWRIGHT_MODULE`, для Chrome — `CHROME_PATH`. На Windows production build использовал `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe` для существующего SVG glob.

## Изменённые файлы

- `projects/social_platform/src/app/api/project/facades/edit/project-team.service.spec.ts`
- `projects/social_platform/src/app/api/project/facades/edit/project-team.service.ts`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.html`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.scss`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.spec.ts`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.ts`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.html`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.scss`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.spec.ts`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.ts`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/project-team-step.component.html`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/project-team-step.component.scss`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/project-team-step.component.spec.ts`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/project-team-step.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-invite/profile-project-invite-modal.component.html`
- `projects/social_platform/src/app/ui/widgets/project-invite/profile-project-invite-modal.component.spec.ts`
- `projects/social_platform/src/app/ui/widgets/project-invite/profile-project-invite-modal.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-invite/project-invite-dialog.component.scss`
- `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/_team-member-row.scss`

QA: `docs/project-team-redesign/README.md`, `visual-results.json`, `preview/{main.ts,index.html,tsconfig.json,serve.py,visual-acceptance.cjs}` и 19 PNG в `screenshots/`.
