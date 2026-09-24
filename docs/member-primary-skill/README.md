<!-- @format -->

# Один основной навык в карточке участника

Base DEV: `63e67b3b59513f7a82f23122c4a51440251b280f` (после #378).
Ветка: `fix/dev-member-primary-skill`. Точный head указан в Draft PR.

## Правило отображения

Карточка показывает первый навык в исходном порядке данных. Остальные
учитываются в `+N`, где N = число навыков − 1. Сортировки нет; при нуле навыков
строка остаётся пустой и сохраняет высоту 22 px. Полный текст основного навыка
доступен через `title`; список скрытых навыков сохранён в title/aria-label счётчика.

Единая flex-строка для всех ширин: основной навык занимает свободное место,
счётчик расположен справа и не сжимается. Gap — 4 px, chip — 22 px,
font-size — 10 px, line-height — 16 px, padding — 3px 7px.
Основной текст выровнен слева, не переносится и обрезается многоточием.
Счётчик имеет прежнюю ширину 40 px и font-weight 600.

`fitMemberSkills`, скрытый измерительный слой, ResizeObserver и измерение
шрифтов уже удалены в #378. Проверка usages не нашла их в runtime-коде текущей
страницы. Здесь удалены только прежние grid-правила для двух навыков и отдельная
мобильная раскладка навыков; все viewport используют одно правило.

Изменены только `member-card.component.ts`, `.html`, `.scss`, `.spec.ts`
и документация задачи. Mobile layout/filters из #378, поиск, статистика,
ширина и высота карточки, имя, secondary info, avatar, CTA и маршруты не менялись.
Backend, React, зависимости, test setup и workflows не затронуты.

## Визуальная проверка

Использованы реальные Angular-компоненты в локальном development preview,
оболочка office и синтетическая fixture из шести карточек:

1. Java.
2. PostgreSQL, Node.js → PostgreSQL +1.
3. Ведение социальных сетей и ещё четыре навыка → +4.
4. Python и ещё десять навыков → +10.
5. Пустой список.
6. Очень длинный навык: «Ведение социальных сетей и контент-маркетинг для международных образовательных проектов».

Сравнение выполнено до/после на одной fixture при масштабе 100%.

| Viewport   | Колонки | Карточка до/после | Skill-area до → после | Overflow |
| ---------- | ------- | ----------------- | --------------------- | -------- |
| 1440 × 900 | 4       | 156 × 248         | 48 → 22 px            | Нет      |
| 1024 × 900 | 3       | 156 × 248         | 48 → 22 px            | Нет      |
| 768 × 900  | 2       | 350,5 × 248       | 48 → 22 px            | Нет      |
| 390 × 844  | 1       | 343 × 248         | 48 → 22 px            | Нет      |

Во всех шести карточках и на всех четырёх ширинах измерениями подтверждены:
одна строка, одинаковая высота chips 22 px, основной chip заполняет остаток
ширины, счётчик последний справа, высота карточки 248 px, аватар 70 × 70
в прежних относительных координатах (верх −34 px с учётом border), CTA
32 px на прежнем уровне 203 px от верха карточки. Длинный навык имеет
`scrollWidth > clientWidth`, `white-space: nowrap`, `text-overflow: ellipsis`
и полный title. Browser console errors отсутствовали.
[Результаты измерений](geometry.json).

Скриншоты:

- [Desktop до](screenshots/before-1440.jpg) / [после 1440](screenshots/after-1440.jpg).
- [1024](screenshots/after-1024.jpg), [tablet 768](screenshots/after-768.jpg).
- [Mobile до](screenshots/before-390.jpg) / [после 390](screenshots/after-390.jpg).
- [Счётчики +4 и +10](screenshots/mobile-hidden-counts.jpg).
- [Ноль навыков и очень длинный навык](screenshots/mobile-empty-long.jpg).

## Проверки

Node 20.20.2; существующий node_modules установлен через npm ci в #378,
package.json и lockfile с тех пор не менялись.

- Targeted: `npm run test:ci -- --pool=forks projects/social_platform/src/app/ui/pages/members projects/social_platform/src/app/api/member`
  — **24/24**, 6 файлов, exit 0. Включены неизменённые regression tests поиска
  и mobile filters. Проверяются 0/1/2/5/11/50 навыков, исходный порядок,
  точный +N, title длинного текста, аватар и CTA.
- `npm run lint:ts` — exit 0, шесть существующих предупреждений в других файлах.
- `npx stylelint <changed SCSS>` — exit 0.
- `npx prettier --check <changed files>` — exit 0 (SCSS исключён штатным
  prettierignore и проверен Stylelint).
- `npm run build:prod` — exit 0 с существующими предупреждениями Angular
  templates/CommonJS/бюджетов сборки.
- `git diff --check` — exit 0.
- Полный `npm run test:ci -- --pool=forks` — **1796/1796**, 388 файлов,
  exit 0, без unhandled errors. Режим выбран CLI-параметром, конфигурация не менялась.
- `npm run test:ci` — exit 1: NG0401 в setupTestBed до выполнения тестов.
  Это известный baseline, воспроизведённый при #378; см.
  [предыдущую приёмку](../member-mobile-skills/README.md). Test harness не менялся.

Ограничения: скриншоты локальные, на синтетических данных, без live DEV/PROD.
У существующего Windows build:sprite одинарные кавычки glob приводят к пустому
sprite: автоматически изменённый артефакт после build:prod восстановлен из HEAD.
Development preview использует исходный валидный sprite. Корректность иконок
в локальном Windows prod-артефакте не заявляется; скрипт сборки не менялся.

Merge/deploy не выполнялись.
