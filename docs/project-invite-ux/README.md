<!-- @format -->

# PROD: приглашение участников в проекты

Селективный перенос только Angular UX из [DEV PR #383](https://github.com/PROCOLLAB-github/procollab/pull/383).

- Exact PROD base: `01d59ad59578d26777625b0a32658acbf52ec6fc` (`master`).
- Source feature head: `4325cbbf5fcfd5b8c48fa2a6dd5d9c0122602940`.
- Source DEV merge: `7f6a79347500db0140f2ef57e1dd381b578ab653`.
- Ветка: `release/prod-project-invite-ux`; exact итоговый head указан в Draft PR → master.

Перед переносом выполнен fetch и проверены исходный PR и различия PROD/DEV в каждом
затрагиваемом файле. Перенесены только изменения функциональности #383; merge DEV
и cherry-pick merge commit не выполнялись. Сохранено PROD-отличие в
`detail.component.html`: `target="_blank" rel="noopener noreferrer"` для ссылки
регистрации программы. Остальной новый код совпадает с source feature head.
Прочие PROD-изменения, включая notification center, остались на месте.

## Поведение

**Профиль `/office/profile/:id` → «пригласить».** Получатель известен из route.
Окно содержит заголовок, локальный поиск своих проектов, отдельно прокручиваемый
список, роль, inline error и footer. Вся строка выбирает проект, выбранная строка
выделена и имеет `aria-checked`. Роль и действия расположены вне scroll-контейнера.
Успех закрывает и очищает окно, показывает «Приглашение отправлено», оставляет
пользователя на профиле. Старый success modal и переход в проекты после отправки удалены.
Typed ошибки сохраняют выбор проекта и роль.

**Редактор проекта → команда → «Пригласить участника».** CTA открывает окно поиска
по имени/фамилии вместо старой inline-формы с URL. Create form содержит только
`recipientId` и `role`; URL parsing и URL validation удалены. Кандидаты показывают
публичные имя, avatar, возраст, speciality, до двух skills и +N без запросов
детального профиля. Leader, collaborator и получатель pending invite видны с
причиной запрета выбора. × очищает выбранного участника и возвращает фокус в поиск.
Успешный ответ добавляется в существующий `invites()`, окно закрывается, query,
выбор, роль, error и loading очищаются, появляется snackbar.

Оба сценария защищены от double-submit; закрытие отменяет клиентское ожидание
ответа. Новый UI разделён на search facade, form/candidate helpers, локальную
оболочку диалога, role input, participant picker и два компонента окон.

**Роль:** общий `ProjectInviteRoleInputComponent`, 13 подсказок из #383 плюс
свободный ввод любого значения. Подсказки не являются enum. Label «Роль в проекте»,
placeholder «Например: Backend-разработчик». Перед отправкой trim/collapse пробелов,
регистр сохраняется. Required и максимум 128 символов после нормализации.

## API и границы переноса

| Операция  | Существующий контракт                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------- |
| Поиск     | `GetMembersUseCase → MemberRepositoryPort → GET /auth/public-users/`                                     |
| Параметры | `user_type=1, fullname=<normalized>, limit=8, offset=0`                                                  |
| Отправка  | `SendForUserUseCase → POST /invites/`: `user, project, role`                                             |
| Legacy    | `PATCH /invites/:id/`, `DELETE /invites/:id/`, `POST /invites/:id/accept/`, `POST /invites/:id/decline/` |

Поиск: минимум 2 символа, debounce 300 ms, distinct; предыдущий запрос отменяется
сразу при изменении поиска. `user_type=1` добавляет существующий adapter.

`partner_program` добавляется только из положительного целочисленного
`partnerProgram.programId` загруженного Project, совпадающего с route ID.
`programLinkId`, relation ID, `current_application` и query params не используются
как источник program ID. При отсутствии надёжного ID поиск глобальный; backend
validation остаётся окончательной. Смена route очищает старый контекст и окно.

Backend, React, DEV, dependencies, workflows, общий test harness, глобальный
`app-modal`, каталог участников, lifecycle, права и notification center не менялись.
`specialization` сохранён в модели/API и legacy редактировании Invite/Collaborator;
новая форма создания его не отправляет. Accept/reject/revoke сохранены.

## Доступность и размеры

Focus first/restore, focus trap, Escape (сначала подсказки, затем окно),
ArrowUp/Down/Enter для autocomplete, Enter/Space для строк, touch targets ≥44 px,
radio 20×20 px. Desktop width 552 px; mobile width ≤viewport−24 px и max-height
≤100dvh−24 px. Центр прокручивается отдельно от заголовка, роли и footer.

## QA

Свежие проверки выполнены на PROD base и этой ветке. Результаты команд, количества
тестов/assertions, exit codes, unhandled errors и ограничения — в [checks.md](checks.md).
Браузерные численные замеры — [visual-results.json](visual-results.json).

| Состояние                     | Скриншот                                         |
| ----------------------------- | ------------------------------------------------ |
| PROD до: профиль              | [01](screenshots/01-before-profile.png)          |
| После: 2 проекта              | [02](screenshots/02-after-profile.png)           |
| 12 проектов                   | [03](screenshots/03-profile-long-list.png)       |
| Последний проект, footer      | [04](screenshots/04-profile-selected-footer.png) |
| PROD до: URL-форма            | [05](screenshots/05-before-team-url.png)         |
| Поиск участника               | [06](screenshots/06-participant-search.png)      |
| Результаты и disabled причины | [07](screenshots/07-search-results.png)          |
| Выбранный участник            | [08](screenshots/08-selected-participant.png)    |
| Autocomplete роли             | [09](screenshots/09-role-autocomplete.png)       |
| Профиль 375 px                | [10](screenshots/10-mobile-profile.png)          |
| Команда 375 px, ошибка        | [11](screenshots/11-mobile-team.png)             |
| Loading                       | [12](screenshots/12-search-loading.png)          |
| Inline error                  | [13](screenshots/13-inline-error.png)            |
| Нет проектов                  | [14](screenshots/14-no-projects.png)             |

## Воспроизведение браузерной проверки

Preview использует реальные `DeatilComponent`, `ProjectTeamStepComponent`, фасады
отправки и `SendForUserUseCase`, их шаблоны/стили на PROD base. Данные, ответы API
и окружающая навигация подменены. Поиск в браузере подменяет `GetMembersUseCase`;
реальный use case/adapter и HTTP-параметры отдельно проверены Vitest.
Скриншоты «до» собраны из exact PROD base в отдельном worktree.
Авторизованный live PROD, серверная доставка уведомлений и физическая мобильная
клавиатура не проверялись; реальные приглашения не отправлялись.

После `npm ci`:

```sh
npx ng build social_platform --configuration=development --browser=docs/project-invite-ux/preview/main.ts --ts-config=docs/project-invite-ux/preview/tsconfig.json --index=docs/project-invite-ux/preview/index.html --output-path=tmp/invite-preview
```

Из `tmp/invite-preview/browser` запустите `python <absolute-path>/preview/serve.py 4337`.
Для «до» скопируйте только preview в отдельный worktree base SHA, соберите той же
командой и запустите сервер на 4338. Затем из корня этой ветки:

```sh
node docs/project-invite-ux/preview/visual-acceptance.cjs
node docs/project-invite-ux/preview/keyboard-rows.cjs
```

Требуется Playwright; `PLAYWRIGHT_MODULE` и `CHROME_PATH` позволяют использовать
внешний runtime и установленный Chrome без изменения зависимостей проекта.
Preview не входит в production bundle. На Windows для существующего SVG glob
`npm run build:prod` используется `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`.

Merge и deploy в рамках переноса не выполнялись.
