<!-- @format -->

# Проверки PROD-переноса

Дата: 2026-09-28. Windows, Node 20.20.2, npm 10.8.2, Chrome 154.0.8037.57.
Exact base: `01d59ad59578d26777625b0a32658acbf52ec6fc`.
Это новые запуски на PROD-ветке; результаты DEV не переиспользованы.
Дополнительная браузерная проверка Enter/Space: 9 assertions, exit 0, runtime errors 0;
итого **718 browser assertions**. [Результаты](keyboard-results.json).

| Проверка                                 | Tests / assertions                     | Exit code | Unhandled errors |
| ---------------------------------------- | -------------------------------------- | --------- | ---------------- |
| Targeted Vitest, forks                   | 111/111 тестов, 17 файлов              | 0         | 0                |
| Полный `npm run test:ci -- --pool=forks` | 1951/1951 тестов, 402 файла            | 0         | 0                |
| Chrome / Playwright                      | 709 assertions, 64 состояния геометрии | 0         | 0 runtime errors |

Vitest сообщает количество тестовых сценариев, а не число вызовов `expect`.
Targeted: 26.13 s; полный suite: 279.72 s. Shared test harness и его существующие
исключения сохранены. Предупреждения NG0912 существующих IconComponent не скрывались;
unhandled errors и unhandled rejections отсутствуют.

## Статические проверки и сборка

| Команда                                                                                | Результат                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `npm run lint:ts`                                                                      | Exit 0; 0 ошибок, 6 существующих warnings вне нового UX |
| `npx stylelint 'projects/social_platform/src/app/ui/widgets/project-invite/**/*.scss'` | Exit 0                                                  |
| `npx stylelint 'projects/**/*.scss'`, без `--fix`                                      | Exit 0                                                  |
| Prettier всех изменённых текстовых файлов, включая SCSS                                | Exit 0                                                  |
| `npm run build:prod`                                                                   | Exit 0                                                  |
| `git diff --check`                                                                     | Exit 0                                                  |

Первый Prettier check выявил форматирование/CRLF свежего checkout. Изменённые файлы
нормализованы Prettier; повторная проверка прошла. Это не меняет функциональность
source: все перенесённые файлы кода совпадают с #383, кроме сохранённых двух строк
PROD-ссылки регистрации в `detail.component.html`.

Сборка использовала неизменённые scripts/dependencies. На Windows задан
`npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`, чтобы существующий
SVG glob обрабатывался корректно. Generated sprite не отличается от base.
Сохраняются предупреждения проекта о Sass, optional chaining, CommonJS и бюджетах.
Стиль нового диалога — 5.93 kB при warning budget 2 kB / error threshold 15 kB;
сборка успешна, budgets не менялись.

## Покрытие регрессии

- Профиль и entrypoint: реальные компоненты в браузере; существующие profile/detail
  тесты в полном suite. Локальный поиск проектов, выбор, success без redirect,
  typed inline ошибки с сохранением значений — targeted и браузер.
- Редактор/команда: CTA вместо URL, публичные результаты, выбранный участник,
  pending append, reset, double-submit, сохранение legacy edit specialization
  и revoke — targeted. Остальные сценарии editor/save/canonical program lifecycle
  прошли в полном suite.
- Program-linked project: только authoritative `Project.partnerProgram.programId`,
  проверка совпадения route, очистка stale контекста, глобальный fallback.
  Реальная цепочка `GetMembersUseCase → MemberHttpAdapter` проверяет HTTP-параметры;
  debounce/distinct/cancel покрыты целевыми тестами.
- Incoming accept/reject и существующие invite HTTP-контракты прошли в полном suite;
  реализация этих операций не менялась.
- Роль: 13 подсказок, свободное значение, нормализация с сохранением регистра,
  required/max128, клавиатура и touch.

## Browser acceptance

Ширины: **1440, 1280, 1024, 768, 414, 390, 375 px**.
На каждой проверены профиль с 2/12 проектами, длинное название, первый/последний
выбор, видимые role/footer; команда с empty/loading/results, недоступными
кандидатами, выбранным участником, custom role и inline error.
Дополнительно: autocomplete, touch, focus trap/restore, Escape, Enter/Space,
1/8 результатов, stale search, глобальный поиск, оба success/reset, отсутствие проектов.

Horizontal overflow **0**; все 64 замера укладываются в размеры viewport и сохраняют
видимые header/footer. Runtime errors **0**.
14 новых [скриншотов](screenshots/), [численные результаты](visual-results.json),
[воспроизводимый preview](preview/visual-acceptance.cjs).

Проверки локальные, с реальными Angular-компонентами и подменёнными данными/API.
Авторизованный live PROD, серверная доставка уведомлений и физическая мобильная
клавиатура не проверялись. Реальные приглашения не отправлялись. Методика и команды
в [README](README.md).
