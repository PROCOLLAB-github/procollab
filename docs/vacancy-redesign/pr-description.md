## Что меняется

Шесть областей вакансий приведены к согласованным [экранам Figma](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=51-1751): вакансии проекта, общий список, страница вакансии, успешное создание, отклики и «Мои отклики». Исправлены гонки поиска навыков и синхронизация Autocomplete, библиотеки и корзины.

Закрыты оба замечания дополнительного ревью общих форм:

- После reload участники, поля и URL теперь используют один набор `fullname`, `skills__contains`, `speciality__icontains`, `age`, `is_mospolytech_student`. Начальное состояние загружается resolver без второго запроса. Back/Forward, сброс и повторный выбор восстанавливают форму. Отложенные навигации сериализованы; более ранний URL не стирает последующую правку, а Back/сброс отменяют устаревшую очередь.
- Длинный навык при 390/320 px переносится, кнопка удаления остаётся видимой. Нативная кнопка имеет доступное имя, focus-visible, disabled CVA, не отправляет форму. На mobile цель 44×44 px. Исправлена сетка мобильного профиля; общая корзина проверена также в онбординге и редакторе вакансии.

[Воспроизведение, причины, DEV-проверки и мобильные скриншоты](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/autocomplete-followup-review.md). До исправления обеих проблем — 4 failing regressions; добавлено 20 тестов.

## Проверки финального кода

Кодовый коммит **`f1ea89bec92e2e37b89044aa4663b40807ba0be0`**. Последующий коммит содержит только отчёты и скриншоты.

- Полный настроенный Vitest: **404 файла / 1991 тест passed**, exit 0, 605.44 с. Node 20.20.2, heap 8 GB, 2 workers. [SHA, команда, число тестов и хэш лога](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/full-suite-results.json).
- `npm run build:prod`: exit 0, 45.855 с; initial 1.39 MB / transfer 313.29 kB.
- Целевые ESLint и Stylelint без автофикса: exit 0; git diff --check: passed.
- 32 целевых Vitest-проверки, включая асинхронный Router, reload без повторного запроса, age/false, сброс пустого URL и доступное удаление.
- 25 браузерных проверок корзины на 390/320, с Mont, длинным словом без пробелов, эмуляцией касания, Space/Enter и отсутствием overflow/submit; JS errors []. Это **локальные fixtures**, [результаты](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/basket-layout-results.json).
- Повторены 18 браузерных проверок skills-acceptance: отмена конкурирующих ответов, поиск/библиотека/удаление/create/update/reopen на fixtures; JS errors []. Скриншоты редактора навыков обновлены.
- **Ручной DEV smoke**: один GET после reload со всеми фильтрами; true/false и возраст; сброс, повторный выбор, Back/Forward, мобильное окно, быстрый fullname. Профиль/онбординг/редактор проверены при 390/320. В QA-вакансии 104: удалить длинный навык → PATCH 200 → reload → Angular/CSS и 100 ₽. [HTTP evidence](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/autocomplete-followup-dev-results.json).

Предыдущие проверки шести экранов (399 assertions / 52 состояния) и первоначального DEV create/update/reopen сохранены в отчёте как история; это не новый прогон всех визуальных сценариев на текущем SHA.

Первый полный прогон этого дополнения на `1e17d297` нашёл старый mock resetFilters в мобильном тесте и таймер ngx-autosize после teardown в news-form. Исправлены только два spec-файла; тесты не исключались. Полный набор и production повторены на финальном SHA. Runtime-код ручного DEV smoke идентичен финальному.

## UI KIT и API

Реальный Mont, CTA `#8A63E6`, глобальные токены и существующие Button/Tag/Modal сохранены. PROPOSED применяются только к вакансиям и не объявлены утверждёнными глобальными компонентами. [Соответствие Figma → Angular](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/README.md#figma-и-ui-kit). Endpoints, payload requiredSkillsIds, права и маршруты не менялись; миграции backend не нужны. Fixture/proxy entry points не входят в production.

## Ограничения

- Контраст существующего CTA ≈4,02:1, ниже AA 4,5:1 для обычного текста. Полный contrast PASS не заявляется; глобальные токены не изменены. Inter в Figma остаётся временным предпросмотром.
- Age/student скрыты в существующем шаблоне: вручную проверены URL и DEV API, гидратация/изменения контролов покрыты тестами. Проверка видимых контролов не заявляется.
- Профиль не сохранялся, стадии онбординга не отправлялись. Реальные решения по откликам и отрицательные backend permission-сценарии не выполнялись. QA-вакансия 104 оставлена закрытой.
- Принудительное переупорядочивание ответов и touch проверены локальными тестами/эмуляцией; физическое мобильное устройство не использовалось.
- Существующие Angular/Sass/CommonJS/budget warnings и три исключения Vitest остаются; бюджеты и конфигурация исключений не менялись. Repo-wide pre-commit с Stylelint --fix пропущен для коммита, целевые проверки выполнены отдельно без изменения hooks.
- CSS корзины: 4.37 → 4.97 kB при уже превышенном warning-пороге 2 kB; порог не повышался.

**PR остаётся draft** для решения ревьюера о ready for review. Merge и deploy не выполнялись.
