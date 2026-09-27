<!-- @format -->

# Проверки

## Автоматические тесты

| Запуск                                   | Результат                                           | Exit code | Unhandled errors |
| ---------------------------------------- | --------------------------------------------------- | --------- | ---------------- |
| Targeted Vitest, forks                   | 111 тестов / 17 файлов, все прошли                  | 0         | 0                |
| Полный `npm run test:ci -- --pool=forks` | 1845 тестов / 395 файлов, все прошли                | 0         | 0                |
| Chrome, Playwright                       | 709 assertions / 64 состояния геометрии, все прошли | 0         | 0                |

Число тестов Vitest не является суммарным числом вызовов `expect`.
Проверены также legacy accept, reject, revoke и edit specialization. Полный runner
и его существующие исключения не изменены. Предупреждения NG0912 в существующих
компонентах отображались; необработанных ошибок, включая ngx-autosize teardown, не было.

## Статические проверки и сборка

| Команда                                                                                       | Результат                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `npm run lint:ts`                                                                             | Exit 0; 0 errors, 6 существующих warnings вне нового UX |
| Scoped `npx stylelint 'projects/social_platform/src/app/ui/widgets/project-invite/**/*.scss'` | Exit 0                                                  |
| Общий `npx stylelint 'projects/**/*.scss'`, без исправлений                                   | Exit 0                                                  |
| Prettier изменённых текстовых файлов, включая новые SCSS                                      | Exit 0                                                  |
| `npm run build:prod`                                                                          | Exit 0                                                  |
| `git diff --check`                                                                            | Exit 0                                                  |

Production build использует неизменённые scripts/dependencies. На Windows установлен
`npm_config_script_shell=C:\Program Files\Git\bin\bash.exe` для существующего SVG glob.
Сгенерированный sprite не отличается от base.

Сохраняются предупреждения существующего проекта о Sass, CommonJS и бюджетах.
Локальный общий стиль нового окна также превышает warning budget 2 kB:
5.93 kB при error threshold 15 kB. Сборка успешна; budgets не менялись.

## Визуальные проверки

Chrome 154.0.8037.57, ширины 1440/1280/1024/768/414/390/375 px.
709 assertions, 64 состояния, horizontal overflow 0, browser runtime errors 0.
Проверены клавиатура, focus trap/restore, touch-выбор подсказки, закрытие/reset,
inline ошибки и оба success-сценария.

14 скриншотов: [каталог](screenshots/). Численные результаты:
[visual-results.json](visual-results.json).
Методика и ограничения preview описаны в [README](README.md).
