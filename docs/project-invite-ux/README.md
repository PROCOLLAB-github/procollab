<!-- @format -->

# Приглашение участника в проект: UX и QA

Основа: Angular legacy `dev`, exact SHA
`19927ec09d337a69eee63c7050bc6d46f89f79a4`.
Изменения предназначены для одного Draft PR → dev. Merge и deploy не выполнялись.

## Два входа

- **Профиль /office/profile/:id → «пригласить».** Получатель уже известен из route.
  Поиск фильтрует загруженные `profileProjects()` локально, нормализуя пробелы и регистр.
  Вся строка выбирает проект; выбранная строка имеет фон, рамку и `aria-checked`.
  Прокручивается только список, роль и footer находятся вне него.
- **Редактор проекта → команда → «Пригласить участника».** Вместо inline-формы
  с URL открывается окно поиска по имени/фамилии. Поля `link`, URL pattern и
  `new URL(...)` удалены из создания приглашения. Форма содержит
  `recipientId: number | null` и `role: string`.

Оба окна используют локальную оболочку вокруг существующего `app-modal`.
Глобальный modal и каталог участников не изменялись. После успеха окно закрывается,
значения очищаются, появляется snackbar «Приглашение отправлено»; в редакторе
ответ добавляется в прежний `invites()`. Профиль остаётся открытым без перехода в проекты.
Ошибки показываются внутри окна и сохраняют выбор/роль. Закрытие очищает состояние
и отписывает клиент от незавершённой отправки. Повторное открытие не получает старый ответ.

## Контракты

| Операция        | Существующий контракт                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Поиск           | `GetMembersUseCase → MemberRepositoryPort → GET /auth/public-users/`                                                       |
| Параметры       | `user_type=1, fullname=<trim/collapse>, limit=8, offset=0`                                                                 |
| Отправка        | `SendForUserUseCase → POST /invites/`: `user, project, role`                                                               |
| Legacy операции | `PATCH /invites/:id/`, `DELETE /invites/:id/`, `POST /invites/:id/accept/`, `POST /invites/:id/decline/` остаются прежними |

Минимум 2 символа; debounce 300 мс и `distinctUntilChanged`. Внешний `switchMap`
сразу отменяет предыдущий запрос, включая время ожидания следующего debounce.
`user_type=1` добавляет существующий adapter, без дублирования параметра.
Компоненты не выполняют HTTP напрямую и не используют `MembersUIInfoService`.
Для строк используются только публичные ID, имя, фамилия, avatar, birthday, speciality
и первые два skills с точным +N. Детальные профили по каждой строке не запрашиваются.

**Фильтр программы применяется**, когда у загруженного, совпадающего с route проекта
есть положительный целочисленный `partnerProgram.programId`:
`partner_program=<programId>`. Это поле соответствует программе в существующем
serializer. `programLinkId`, ID связи, query params и `current_application` для поиска
не используются. При отсутствии надёжного ID поиск глобальный.
При смене route старый контекст сразу очищается и окно закрывается.
В обоих случаях серверная проверка приглашения остаётся окончательной.

Руководитель, уже состоящий в команде пользователь и получатель pending invite
видны в результатах, но недоступны для выбора; рядом показана причина.
Выбор можно очистить кнопкой ×. Данные берутся из уже загруженных Project,
`collaborators()` и `invites()`.

Backend, React, права, lifecycle проекта, submission программы, уведомления и зависимости
не изменялись. `specialization` не передаётся при создании; legacy редактирование
Invite/Collaborator и модель сохранены. Typed mapping ошибок сохранён; в сообщении
`user_not_found` предложение проверить ссылку заменено предложением выбрать участника.

## Роль и доступность

`PROJECT_ROLE_SUGGESTIONS` — 13 подсказок, не enum и не ограничение значений.
Общий компонент допускает свободный ввод и редактирование выбранной подсказки.
Для «анал» находятся «Бизнес-аналитик», «Аналитик», «Data Analyst».
При отправке выполняются trim и collapse пробелов; регистр сохраняется.
Валидация: обязательная непустая роль, максимум 128 символов после нормализации.

Поддержаны ArrowDown/ArrowUp/Enter/Escape, мышь и touch. Escape сначала закрывает
видимые подсказки, затем окно. При открытии фокус в поиске, после закрытия — на
исходной кнопке; Tab удерживается внутри окна. Строки — нативные кнопки с ролью radio,
работают по Enter/Space. Контролы radio 20×20 px, кнопки не ниже 44 px.

Desktop: ширина 552 px, padding 24 px, max-height
`min(720px, 100dvh - 48px)`, список максимум 300 px. До 600 px:
`width: 100vw - 24px`, max-height `100dvh - 24px`, padding 16 px.
Роль, ошибка и footer не входят в прокручиваемый список.

## Результаты проверки

Среда: Windows, Node 20.20.2 / npm 10.8.2, Chrome 154.0.8037.57.

| Проверка               | Тесты / assertions                     | Exit code | Unhandled errors |
| ---------------------- | -------------------------------------- | --------- | ---------------- |
| Targeted Vitest, forks | 111/111 тестов, 17 файлов              | 0         | 0                |
| Полный Vitest, forks   | 1845/1845 тестов, 395 файлов           | 0         | 0                |
| Браузерная проверка    | 709 assertions, 64 состояния геометрии | 0         | 0                |

Vitest выводит число тестовых сценариев, а не суммарное число вызовов `expect`.
Shared test harness не изменялся. Existing accept/reject/revoke, редактор проекта,
карточки команды и профиль покрыты целевыми и полными regression-проверками.
В targeted проверке используется реальная цепочка use case/adapter для HTTP-параметров.
Полный suite запускался командой `npm run test:ci -- --pool=forks`.

Проверены ширины **1440, 1280, 1024, 768, 414, 390, 375**.
На каждой: профиль с 2/12 проектами, первым/последним выбором и длинным названием;
команда с пустым поиском, loading, 1/8 результатами, недоступными кандидатами,
выбранным участником, длинной ролью и inline error.
Horizontal overflow = **0**; header/footer видимы, роль вне списка.
Дополнительно проверены focus trap/restore, touch-подсказка, отсутствие проектов,
оба success-сценария, глобальный поиск без программы и reset после повторного открытия.
Численные замеры: [visual-results.json](visual-results.json).

TypeScript lint: exit 0, 0 ошибок, 6 существующих предупреждений вне нового UX.
Stylelint, Prettier, production build и diff-check: результаты зафиксированы
в [checks.md](checks.md). Существующие предупреждения Angular/Sass и NG0912
не скрывались и не исправлялись в этой задаче.

## Скриншоты

| Состояние                      | Файл                                             |
| ------------------------------ | ------------------------------------------------ |
| Старое окно профиля            | [01](screenshots/01-before-profile.png)          |
| Новое окно, 2 проекта          | [02](screenshots/02-after-profile.png)           |
| 12 проектов                    | [03](screenshots/03-profile-long-list.png)       |
| Последний проект, footer видим | [04](screenshots/04-profile-selected-footer.png) |
| Старая URL-форма команды       | [05](screenshots/05-before-team-url.png)         |
| Новый поиск участника          | [06](screenshots/06-participant-search.png)      |
| Результаты и disabled причины  | [07](screenshots/07-search-results.png)          |
| Выбранный участник             | [08](screenshots/08-selected-participant.png)    |
| Подсказки роли                 | [09](screenshots/09-role-autocomplete.png)       |
| Профиль, 375 px                | [10](screenshots/10-mobile-profile.png)          |
| Команда, 375 px, inline error  | [11](screenshots/11-mobile-team.png)             |
| Loading                        | [12](screenshots/12-search-loading.png)          |
| Ошибка внутри окна             | [13](screenshots/13-inline-error.png)            |
| Нет проектов                   | [14](screenshots/14-no-projects.png)             |

## Границы QA и воспроизведение

Это локальные браузерные проверки **реальных DeatilComponent и ProjectTeamStepComponent**
с их production-шаблонами, стилями и новыми компонентами окон.
Профильные и командные приглашения используют реальные фасады отправки и SendForUserUseCase.
Данные/ответы API и окружающая навигация заданы в изолированном preview.
Поиск в браузере подменяет GetMembersUseCase; реальный HTTP-контракт проверен отдельно в Vitest.
Скриншоты «до» собраны из exact base SHA в отдельном worktree.
Авторизованная сессия живого DEV, серверная доставка уведомлений и реальный мобильный
экран с экранной клавиатурой в эту проверку не входили. Реальные приглашения не отправлялись.

Исходники preview лежат в [preview](preview/). Они не входят в production bundle.
Для повторения после `npm ci` соберите текущую ветку:

```sh
npx ng build social_platform --configuration=development --browser=docs/project-invite-ux/preview/main.ts --ts-config=docs/project-invite-ux/preview/tsconfig.json --index=docs/project-invite-ux/preview/index.html --output-path=tmp/invite-preview
```

Запустите `python <абсолютный путь>/preview/serve.py 4337` из
`tmp/invite-preview/browser`. Для «до» скопируйте только папку preview в отдельный
worktree base SHA, выполните ту же сборку и запустите сервер на 4338.
Затем из корня текущей ветки:

```sh
node docs/project-invite-ux/preview/visual-acceptance.cjs
```

Нужен доступный Playwright; `PLAYWRIGHT_MODULE` может указывать на имеющийся внешний
runtime, `CHROME_PATH` — на установленный Chrome. Зависимости проекта не менялись.
На Windows `npm run build:prod` запускался с Node 20 и
`npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`, чтобы существующий
glob генерации SVG обрабатывался Bash.
