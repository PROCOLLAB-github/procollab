<!-- @format -->

# Воспроизведение проверок

Рабочий каталог — корень Angular-репозитория. Node 24.19.0, Angular 20.3, Chromium `/usr/bin/chromium`. Playwright доступен в среде выполнения; зависимость приложения не добавлялась. Fixtures используют `esbuild` из существующего toolchain и исходный C00 Solution contract fixture. Токены стенда синтетические, реальные учетные данные не используются.

## Браузер

```sh
NG_BUILD_MAX_WORKERS=2 npx ng serve social_platform --host 0.0.0.0 --port 4200 --no-open
node docs/program-v2-ui-audit/browser-check.cjs after
node docs/program-v2-ui-audit/interaction-check.cjs after
node docs/program-v2-ui-audit/state-check.cjs
node docs/program-v2-ui-audit/visual-contract.cjs
```

Последние скрипты открывают настоящий Angular, подменяют API только внутри Playwright, блокируют внешние запросы/сокеты и сохраняют PNG/JSON в этот каталог. Они не встроены в runtime приложения. `WIDTHS=390,1440`, `SCREENS=experts,distribution`, `CASES=experts-filter-dialog,experts-filters` позволяют адресно повторить проверку. Основной результат: 140 + 395 + 40 + 5 успешных проверок после изменений.

Снимки `before` получены отдельным запуском исходного worktree `9ef90b58` на порту 4201 с теми же fixtures:

```sh
PROGRAM_UI_BASE=http://127.0.0.1:4201 node docs/program-v2-ui-audit/browser-check.cjs before
```

`interaction-check` имеет совместимые ветви для выбранных before-сценариев. Итоговые JSON объединяют последние адресные перезапуски после исправлений по ключу version/screen-or-scenario/width. Старые промежуточные снимки исключены из выдаваемого архива. В репозитории оставлен компактный набор основных сравнений; полный архив содержит все финальные снимки и результаты.

## Тесты и код

```sh
python3 docs/program-v2-ui-audit/run-tests.py
npm run test:solution-contract
git diff --check
```

`run-tests.py` запускает весь настроенный набор по восемь файлов, один fork worker с heap 1536 MB. Это устраняет OOM Cloud; excludes совпадают с существующим Vitest config. Результаты каждого файла агрегируются в `tests-results.json`. Первые попытки общего запуска/более крупных пачек прерывались по памяти; последний успешный набор и адресная перепроверка после исправления V1 tooltip дали 3089 passed / 0 failed / 0 pending. Тесты не отключались и assertions не ослаблялись.

Подробные `*-results.json` и извлеченные тексты контрактов Figma включены в полный архив. В git сохранены компактная сводка, карта фреймов, build status и сравнение V1; скрипты при повторном запуске создают полные JSON в своем каталоге.

ESLint выполнялся для всех измененных/новых `.ts`, Stylelint без `--fix` для `.scss`, Prettier `--check` для `.ts` и `.html`. SCSS исключен существующим `.prettierignore` и проверен Stylelint. Итоги содержатся в `verification-summary.json`. Глобальные команды с автоматическим форматированием посторонних файлов не запускались.

## Сборка

```sh
NG_BUILD_MAX_WORKERS=2 npm run build:prod
NG_BUILD_MAX_WORKERS=2 node docs/program-v2-ui-audit/production-build.cjs
PROGRAM_UI_COMPILE_ONLY=1 NG_BUILD_MAX_WORKERS=2 node docs/program-v2-ui-audit/production-build.cjs
python3 docs/program-v2-ui-audit/serve-production.py
PROGRAM_UI_BASE=http://127.0.0.1:4365 WIDTHS=390,1440 SCREENS=projects,experts,distribution,analytics node docs/program-v2-ui-audit/browser-check.cjs production-smoke
```

Первая команда FAILED на заблокированном скачивании Google Fonts. Вторая оставляет исходные budgets и отключает только font inlining; FAILED на пяти исходных CSS budgets. Та же проверка исходного worktree подтверждает baseline. Третья отключает контроль budgets только для получения диагностического артефакта; оптимизация JS/CSS/critical CSS сохраняется, конфигурация репозитория не меняется. Она PASS. Последующий smoke 16/16 PASS не означает, что стандартная production-сборка прошла.

## Галерея

```sh
python3 docs/program-v2-ui-audit/build-gallery.py
```

Откройте `gallery.html` напрямую: данные встроены, внешних зависимостей и fetch нет. Можно выбрать экран/ширину/масштаб, раскрыть V1 и открыть PNG. Полная версия галереи в архиве строится тем же скриптом по всем имеющимся финальным снимкам.
