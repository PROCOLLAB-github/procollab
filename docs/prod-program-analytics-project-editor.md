<!-- @format -->

# PROD: аналитика программы и редактор проекта

Выборочный перенос проверенных DEV PR #348, #349, #350, #351 на PROD master
`72b50306cbd7c7fc33e2efad66052c43759b33db`. Слияния dev → master нет.

## Область изменений

- Ролевой виджет программы: организатор → эксперт → участник. Backend
  `GET /programs/{id}/analytics-widget/` определяет права и отдаёт одну ветвь
  метрик. Ошибки сохраняются как ошибки, не становятся нулевыми счётчиками.
- Новости программы загружаются и показываются организатору без member-роли.
  Экспертная роль сама по себе не открывает новости.
- Очистка файлов использует инициализированный `Project.id`, а не корневой
  ActivatedRoute. Невалидные ID и старые повреждённые записи offline queue
  отфильтровываются до запроса. Начальное пустое поле не вызывает PUT.
- Явное удаление presentation сохраняет пустую строку. DELETE 404 идемпотентен;
  network/4xx/5xx сохраняют control и показывают ошибку. Перед публикацией
  очистка подтверждается отдельным сохранением черновика.
- Project-specific `POST /projects/{id}/reset-cover/` и canonical
  `isDefaultCover` исключают DELETE системной обложки. Поле остаётся required.
- Стандартная/пустая обложка показывает «Стандартная обложка» и «Загрузить файл»,
  пользовательская — «Заменить файл». Верхней иконки сброса нет.
  Размеры и соседнее расположение элементов сохранены.

## Совместимость PROD

Существующие `currentProjectApplication` и URL основной legacy-аналитики
`project-analytics` сохранены. Виджет не использует это leader-only поле
для поиска проекта члена команды; его `participantProject` приходит отдельно.

PROD hotfix уведомлений, вакансий, регионов и другие отличия master остаются.
Shared app-modal и app-soon-card, зависимости, CI/workflows не изменяются.
React и его доменные контракты не затрагиваются.

Backend переносится первым: #742 (read-only виджет и is_user_expert) и #743
(reset-cover и is_default_cover). Миграций задачи нет. Старый frontend
совместим с новыми additive endpoints.

## Источники переноса

| DEV PR | Merge commit                               |
| ------ | ------------------------------------------ |
| #348   | `8f59c8ed7bbad1ceb1deba669c65b66a92040231` |
| #349   | `c0bbdd7a97f2575864e3d4d8c7d88e927b61bd47` |
| #350   | `2324f52345fe608991e888a514aefc491e578bcb` |
| #351   | `c66d05db59b6dbae160c0f3fc8853a9fa6644377` |

Большие DEV-only screenshots/diagnostics не включены в PROD diff. Они доступны
в исходных PR. Существующая документация master не удалялась.

## Проверки

Локальный прогон 18.09.2026, Node 20.20.2, отдельная ветка от PROD master:

- `npm ci` — успешно, lockfile не менялся.
- Targeted Vitest (17 файлов, `--pool=forks --maxWorkers=4 --minWorkers=1`) —
  216/216, включая виджет, manager news, autosave, форму, edit info, UploadFile,
  reset-cover и zero state.
- `npm run format:check`, `npm run lint:ts` (0 ошибок, 6 предупреждений),
  scoped Stylelint, `npm run build:prod`, `git diff --check` — успешно.
- `npm run test:ci -- --pool=forks --maxWorkers=4 --minWorkers=1` —
  **exit 1**: 377 файлов и 1728 тестов прошли, но возникла необработанная ошибка
  `ReferenceError: window is not defined` из таймера `ngx-autosize` после teardown
  `profile-mid-side.component.spec.ts`. Этот прогон не считается успешным.

Стандартный локальный pool ранее завершился на NG0401 до выполнения targeted
тестов. Forks меняет только способ изоляции процессов; тесты не исключались,
Vitest config и setup не изменялись. Ошибка полного прогона не подавлена.

PROD-релиз остановлен до snapshot/merge/deploy по условию задачи. Для продолжения
нужен успешный новый полный прогон; старые результаты DEV не заменяют этот gate.

Без отдельного production test account/project нельзя выполнять
авторизованную изменяющую данные приёмку на реальных проектах.
