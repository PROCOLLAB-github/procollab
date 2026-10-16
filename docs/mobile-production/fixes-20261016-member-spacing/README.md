<!-- @format -->

# Отступ между навыками и кнопкой профиля

16.10.2026. Ветка `fix/prod-member-card-spacing-20261016` от production master
`6f12e33579f8015504a26b27f3dd371a6b8b3707`.

Причина: `margin-top:auto` у кнопки при автоматической высоте карточки давал 0px между навыками и действием.
Только в max-width:999px добавлены `margin-top:var(--ui-space-sm)` (8px) и `flex-shrink:0` для действия.
Шаблон, API, навыки/счётчик, ссылка и desktop стили сохранены.

## Проверки и review

- Checked by source: runtime diff — две строки SCSS внутри существующего мобильного media query. Review: actionable findings нет; исправление ограничено сообщённым дефектом.
- Checked in browser: 320/360/390/480/580/640/749/750/768/999px, по четыре карточки на ширине — 20 навыков (+19), четыре (+3), длинное имя/навык и пустые навыки. Было 0px, стало 8px. Кнопка высотой >=44px находится внутри карточки; две колонки и ссылки сохранены.
- Desktop 1000/1440/1920px: 3/3 точных RGB comparisons, 0 отличающихся пикселей. Исходный зазор 15px сохранён.
- Checked by tests: `npm run test:ci -- projects/social_platform/src/app/ui/pages/members/member-card/member-card.component.spec.ts projects/social_platform/src/app/ui/pages/members/members.component.spec.ts` — 2 файла, 8 тестов, exit 0. Новые unit tests для двух строк CSS не добавлялись; регрессия проверяется в браузере.
- Checked by build: `npm run build:prod` — exit 0; прежние CommonJS warnings. Baseline и исправленная сборка используют одинаковый tracked sprite с symbol nodes; CSS/JS bundles не менялись после сборки.
- Static: Stylelint изменённого SCSS и `git diff --check` — exit 0; Prettier проверен для полного staged index с LF, как на CI.

[До](./baseline-580.png) · [После](./verified-580.png) · [Метрики](./spacing-comparison.json) · [Desktop comparison](./desktop-comparison.json).

Воспроизведение на synthetic API: `QA_BUILD_ROOT` указывает на соответствующий production build,
`PLAYWRIGHT_MODULE` и `CHROME_PATH` — как в [общем harness](../README.md#воспроизведение-browser-gate).
Запуск: `node docs/mobile-production/member-card-spacing.cjs baseline`, затем с исправленной сборкой `verified`.

Not checked: физические устройства, Safari/WebKit и live API. Проверено в Chrome/Windows с synthetic API без live mutations.
Merge/deploy выполняет пользователь; миграции не требуются.
