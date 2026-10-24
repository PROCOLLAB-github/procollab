<!-- @format -->

# FE01 — контракт, маршруты и выбор режима

Дизайн D00 v3 утвержден пользователем 24 октября 2026 года. ТЗ: https://chatgpt.com/space/page_9632e9ed74588191b6b3e4b397d55175 . BE01 и FE01 выполняются независимо по C00 1.0.0.

План: сгенерировать полные доменные типы и 43 мока из C00; подключить port → HTTP adapter/repository → use cases; добавить явное получение solution-context перед созданием из программы; сохранить legacy ветку создания; добавить маршруты создания/просмотра/редактирования в контексте program ID. Данные ответа принадлежат активному маршруту; чужой/устаревший ответ не переносится в другую программу. Переход по discriminated union ApplicationRef готовит совместимые legacy ссылки для BE10.

В FE01 реализуется оболочка чтения с двумя разделами утвержденного дизайна. Изменяющие действия зависят от серверных permissions и задач FE03–FE06; не показываются фиктивные сохранение, приглашение или сдача. API моделей не требует Project/Team ID.

Проверки: соответствие моделей/моков C00, wire casing через действующий interceptor, создание/повторное открытие, legacy маршруты, прямые ссылки/invalid IDs, загрузка/ошибка/нет доступа, смена program ID; targeted tests, Angular build, архитектурный lint и доступная browser проверка. Новые режимы не включаются этим PR для существующих программ.

## Verification и review от 24 октября 2026

Checked by source: diff от `origin/dev` 5e22c54c. Доменные типы и независимые сценарии сгенерированы из неизмененного C00 1.0.0. Генератор не зависит от сети: `python tools/generate-solution-contract.py`, затем targeted Prettier. Полные определения приглашений/форм/команд готовы для следующих этапов; FE01 вызывает только контекст, создание и чтение. Adapter списка подготовлен. Project/Team ID в новом создании отсутствуют.

Wire boundary: существующий CamelcaseInterceptor преобразует успешные ответы и тело запроса. Ошибки HttpErrorResponse преобразуются отдельно, включая `field_id` и ключи meta. Неизвестная ошибка показывает безопасный текст. Ветвление по storageMode; при ошибке контекста нет fallback создания проекта. Legacy reference содержит точный programLinkId. При смене программы подписка страницы отменяет предыдущий запрос; entry point игнорирует устаревший результат.

Checked by tests: **40 tests PASS**:

```text
npm run test:ci -- projects/social_platform/src/app/api/solution/solution-contract.spec.ts projects/social_platform/src/app/ui/pages/program/solution/solution.component.spec.ts projects/social_platform/src/app/ui/widgets/detail/services/program/detail-program-info.service.spec.ts projects/social_platform/src/app/ui/routes/program/detail.routes.spec.ts
```

Проверены casing реальных HTTP requests/responses через interceptor, независимые C00 состояния, безопасные ID, error issues/meta, legacy/new маршруты, double click, ошибка контекста, точные ID, отмена старой программы, загрузка страницы, retry, отсутствие повторного POST и переключение вкладки без повторной загрузки.

Checked by build: `npm run build:pr` PASS на штатной environment.ts. Существующие Sass deprecation и Angular template warnings остаются. Scoped ESLint всех новых/измененных TS и scoped Stylelint нового SCSS PASS. Массовый autofix и изменение package/lock не выполнялись.

Checked in browser: обычное Angular приложение на localhost → локальный Django BE01 → изолированная PostgreSQL 18, реальная JWT авторизация и вымышленные данные. Создание дает solution 1 без Project; повтор `/solutions/new` и кнопка программы открывают тот же ID. «Команда» — вторая вкладка той же заявки. GET несуществующего решения показывает not_found с retry; Enter запускает повтор. Старый режим создает проект и открывает прежний редактор с exact programLinkId. Временный локальный API URL восстановлен, в diff environment.ts отсутствует.

Desktop 1280×720 и mobile 390×844 проверены визуально. На mobile scrollWidth=innerWidth=390, font-family Mont. Строки команды перестраиваются в один столбец, вкладки доступны ссылками и имеют aria-current. Семантические heading/main/nav, role=status/alert, native кнопка retry. [Desktop](program-solutions-fe01/team-desktop.png), [Mobile](program-solutions-fe01/team-mobile.png).

| AC в scope FE01                     | Evidence                                                                                   | Verdict           |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | ----------------- |
| AC01: новый путь без Project/Team   | Контекст → create → detail; реальный browser и adapter tests                               | PASS              |
| AC02: повтор открывает ту же заявку | currentApplication redirect без POST; browser и route tests; конкурентность проверена BE01 | PASS              |
| AC20: изоляция программ             | Родительский programId + solutionId, cancellation; test смены программы и backend scoping  | PASS              |
| AC22: прежний редактор              | Legacy context/reference и старые тесты; реальный browser путь с programLinkId             | PASS в scope FE01 |

UI review: иерархия и два раздела согласованного D00 v3; нет конкурирующих или фиктивных изменяющих действий. Существующие Mont, цвета, Button foundation и кабинет; строки с разделителями, без дополнительных карточек. Данные могут переноситься по строкам, mobile порядок чтения совпадает с DOM. Полные формы и invitation modal не входят в FE01 и не считаются реализованными этим экраном.

Review: исправлена нормализация meta ошибок под те же camelCase моки. BLOCKER/MAJOR/MINOR в scope не осталось. Not checked: полный frontend suite, screen reader, четыре роли в браузере, настоящие загрузки/приглашения/сдача; последние относятся к FE03–FE08 и QA01. Негативный доступ проверен server-side в BE01 и в тестах ошибки UI.

Внедрение: сначала BE01 с миграциями и default legacy_project, затем FE01. Новый режим для реальных участников не включать до REL01. Merge и deployment выполняет пользователь.
