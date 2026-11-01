<!-- @format -->

Предлагаемый заголовок: **fix(programs): unify V1/V2 management UI with PROCOLLAB components**

Ветка `fix/program-v2-design-system`; предполагаемая base `dev`, проверена на `9ef90b58`. Описание подготовлено локально. PR не опубликован, merge и deploy не выполнялись. Статус: требуется завершить приемку по ограничениям ниже.

## Что изменено

Управление программами V2 использовало другую таблицу экспертов и стили аналитики для controls и диалогов. Теперь V1/V2 разделяют roster, подписи статусов, геометрию таблиц и сводку оценивания. Заявки, распределение и аналитика V2 следуют композиции V1; новые сущности Solution и действия сохранены.

## Зачем

Восстановить единый ранее согласованный интерфейс PROCOLLAB. [Матрица расхождений, источники и полный отчет](README.md).

## Реализация

Чистые ExpertRosterComponent и EvaluationProgressSummaryComponent получают данные/события; загрузка и бизнес-операции остаются в V1/V2 parents. Общие SCSS mixins заменяют копирование разметки. Исправлены scoped-стили дочерних компонентов, filter Modal, selection/bulk layout, export controls, иконки, alerts, карточки аналитики и мобильные подписи. Уже общие participants/results/settings/certificates проверены регрессионно.

## API

Контракт не менялся: adapters, ports и domain-файлы не затронуты. V2 сохраняет Solution IDs, snapshots, preview/apply tokens, команду, историю, quota и protected/own-team/eligibility. Project API не используется вместо Solution API.

## UI

[Figma UI Kit](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=0-1), [эксперты](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=452-3220), [распределение](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=452-3221). Mont и действующие DS primitives сохранены. [Сравнительная галерея](gallery.html), [review и границы evidence](REVIEW.md). Бизнес-различия восьмиколоночной таблицы V2, формы решения и дополнительной аналитики описаны в README.

## Permissions

Серверные permissions, object scope, guards и route rules не менялись. Клиентские busy/disabled и проверки отсутствия доступа сохранены; 403 проверен на изолированном стенде. Реальная серверная авторизация не проверена.

## Проверки

- [x] 3089 Vitest tests, 498 настроенных файлов, 0 failed/pending; неизмененные три config exclusions.
- [x] `npm run test:solution-contract`.
- [x] ESLint/Stylelint/Prettier всех измененных TS/SCSS/HTML, `git diff --check`.
- [x] Chromium: 140 основных + 395 interactions + 40 states + 5 visual contracts, 320/390/768/1440/1920 px.
- [x] V1: 70 пар снимков, без изменения размеров/геометрии; 60 идентичны попиксельно.
- [x] Оптимизированный диагностический артефакт с отключенным fonts inlining и budgets; 16 browser smoke checks.
- [ ] Стандартный `npm run build:prod`: FAILED из-за Google Fonts 403; затем воспроизведены пять исходных CSS-budget failures на базе и ветке. Production config не ослаблен.
- [ ] Live API, настройки/exports/PDF/email/серверные права и конфликты: нет сессии организатора и тестовых программ.

## Acceptance criteria

- [x] Аудит всех основных management sections, семи настроек, сертификатов и вложенных UI.
- [x] Существенные визуальные отличия исправлены либо объяснены бизнес-моделью.
- [x] Общие визуальные компоненты; данные Project/Solution разделены.
- [x] Desktop/mobile, снимки до/после, tests и код review.
- [ ] Полная работоспособность обеих версий на реальном контуре и успешная стандартная production-сборка — приемка открыта.

## Не проверено

Реальные тестовые программы, серверная запись/экспорт/рассылка и конкурентные операции. Полный context фрейма аналитики Figma не вернулся: использованы структура всех секций, сводка и действующий V1; pixel-perfect каждого состояния не заявляется. Соседние участнические/публичные маршруты не входят в основную browser matrix управления.

## Риски / migration

Миграции и backend rollout не нужны: изменения клиентского представления. Риск общих компонентов покрыт V1/V2 unit и browser regression. После устранения baseline build ограничений и live приемки ветка может проходить обычное внешнее review. Merge и production deploy требуют отдельного разрешения владельца.
