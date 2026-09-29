## Что изменено

Редизайн шести областей вакансий по согласованным [экранам Figma](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=51-1751) и исправление выбора навыков. Поздний ответ поиска больше не заменяет новый; повторный поиск после выбора работает, библиотека и корзина сохраняют одинаковые выбранные id.

## Зачем

Прежние карточки плохо обрабатывали длинные названия, большое число навыков и мобильную ширину. Независимые подписки поиска и общий inlineSkills создавали гонки и нестабильное отображение выбранных навыков.

## Реализация

Локальный SearchesService в редакторе вакансии, switchMap и немедленная отмена до debounce, согласованный сброс Autocomplete/CVA, checked библиотеки вычисляется по id независимо от порядка загрузки. Доменные VacancyStatus/Skills/Letter и окно успешного создания переиспользуют Button/Tag/Modal. Защита от двойного создания, состояние ошибок и обновление карточки после успеха. Named modals поддерживают focus trap, Escape и возврат фокуса. На DEV дополнительно выявлена и исправлена потеря числовой зарплаты при редактировании только навыков; пустая сумма остаётся null, разделители разрядов нормализуются (3 регрессионных теста).

Дополнительная ручная проверка общих форм выявила ошибки, исправленные в этом PR: онбординг читает результат поиска inlineSkills и нормализует пустой черновик без обратного цикла; фильтры участников синхронизируются одним потоком, общий сброс и повтор того же выбора работают. Добавлено 7 регрессионных тестов. [Ручные действия и результаты](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/autocomplete-consumers-review.md).

## API

Endpoints, payload requiredSkillsIds, модели и маршруты не менялись. Production entry point не включает тестовые fixtures/proxy. Миграции backend не требуются.

## UI

Шесть областей, desktop/mobile, пустые и граничные состояния; реальные Mont и CTA #8A63E6. Существующие Button и токены сохранены. PROPOSED используются только для вакансий, не утверждены глобально. [Соответствие компонентов](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/README.md#figma-и-ui-kit), [Figma-аудит](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/figma/design-review.md), [скриншоты](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/README.md#скриншоты).

Контраст канонического CTA ≈4,02:1; обычный текст не проходит AA 4,5:1. Есть ограничения hover/outline/secondary. Полный contrast PASS не заявляется. Figma Inter — временный предпросмотр; runtime использует Mont.

## Permissions

Server-side permissions не менялись. Существующие canManageResponses/canRespond/hasResponded сохранены. Решение по отклику отображается после успешного ответа. Отрицательные backend permission-сценарии не выполнялись.

## Проверки

- [x] До исправления: 8 failing regressions в 4 файлах.
- [x] Полный Vitest на запрошенном 3ef4586: 403 файла / 1964 теста, Node 20.20.2, heap 8 GB, 2 workers, exit 0.
- [x] Новые регрессии: сначала 4 failed, затем ещё 2 failed; после исправлений затронутые 3 файла / 14 тестов passed (7 новых тестов).
- [x] Финальный полный Vitest на 43dc70ff: 403 файла / 1971 тест passed, exit 0; [машинный результат](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/full-suite-results.json).
- [x] npm run build:prod — exit 0; Angular/Sass/CommonJS/budget warnings остаются.
- [x] Браузерные состояния и адаптивность: 399 проверок / 52 состояния, результаты в visual-results.json; реальные Angular-компоненты, синтетические use cases, 1440/768/390/320 px, JS errors [].
- [x] Редактор навыков: 18 браузерных проверок с управляемыми HTTP-ответами; поиск/библиотека/удаление/create/update/reopen и изоляция root inlineSkills; JS errors [].
- [x] Целевые ESLint/Stylelint без автофикса; Impeccable detector [].
- [x] DEV API, последняя локальная сборка: поиск, повтор запроса, библиотека, удаление, создание 201, изменение 200 и новое открытие 200; вакансия 104 в проекте 131. На mobile сохранены Angular/CSS и зарплата 100 ₽. [Evidence](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-vacancy-interface-redesign/docs/vacancy-redesign/dev-results.json).

## Acceptance criteria

- [x] Согласованные шесть областей, CTA/токены/Mont, PROPOSED feature-only.
- [x] Причины гонок воспроизведены и исправлены, локальные round-trip проверки прошли.
- [x] Отчёт различает fixtures и DEV, ограничение контраста описано.
- [x] Подтверждение исправленной ветки через DEV API; штатный refresh после 401 также прошёл.

## Не проверено

Принудительное переупорядочивание ответов проверено на fixtures; на DEV — обычный быстрый ввод. Ручной smoke остальных consumers выполнен: профиль, специальности/навыки онбординга, фильтры участников, desktop/mobile. Сохранение профиля/отправка стадий онбординга, реальные решения по откликам и backend negative permissions не выполнялись. Галерея использует локальное обрамление; глобальная оболочка кабинета и её mobile header не заявляются pixel-for-pixel реализацией Figma.

Ручной smoke не является безусловным PASS. Остались существующие ограничения: после полной перезагрузки не восстанавливаются фильтры участников из URL; на mobile-профиле обрезана кнопка удаления длинного навыка (снятие через библиотеку работает). Они перечислены для решения перед ready for review.

## Риски / migration

Shared Autocomplete/SearchesService затрагивают другие формы; полный набор повторён на 3ef4586 и на последнем коде 43dc70ff после дополнительного smoke. Точный commit/count записан в full-suite-results.json. Figma temporary Inter отличается метриками от Mont. Общий contrast/token review требуется отдельно, глобальные токены здесь не меняются. PR остаётся draft, ready for review не выставлялся; закрытая тестовая вакансия 104 оставлена на DEV с явной QA-маркировкой. Merge и deploy не выполнялись.
