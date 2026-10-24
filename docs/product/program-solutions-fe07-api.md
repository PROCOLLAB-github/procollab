<!-- @format -->

# FE07: подключение контрактов экспертной оценки

Исторический отчет API-блока C00 1.3.0. Текущий статус на 25.10.2026: пользователь согласовал D01; первый экспертный UI реализован на основе свежего общего оценивания из frontend #506 и API #823. Контракт расширен до 1.6.0. Актуальные поведение, проверки и оставшаяся работа описаны в [program-solutions-fe07-ui.md](program-solutions-fe07-ui.md). Полная FE07 еще не завершена.

Контракт C00 1.3.0 синхронизирован с backend: 72 схемы, 32 операции всего, 55 независимых сценариев. Добавлены десять операций: список работ эксперта, frame, сохранение оценки, чтение/запись назначений, предпросмотр/применение распределения, предпросмотр/сохранение N и результаты организатора.

Изменения: generated model/fixtures; SolutionRepositoryPort → SolutionRepository → SolutionHttpAdapter; десять use cases с Result и существующим error converter. Все ID проверяются как положительные safe integers. Query-параметры получают явный snake_case; точные значения кейса, 0 и false сохраняются. Оценки используют string/null, критерий ошибки хранится в criterionId отдельно от fieldId. Подтвержденные criteria revision и подписанный plan token передаются без подмены. Ошибки 409/400 возвращаются вызывающему коду; автоматического повторного POST/PUT нет. Project DTO/ID и старые маршруты не используются вместо решения.

Checked by tests: полный Vitest — 2562 PASS в 466 файлах; десять новых HTTP wire tests с реальным CamelcaseInterceptor проверяют обе стороны десяти методов, роли ID, точные пути, query, string 0/False/null, ошибки критериев, conflict metadata, пустое снятие назначений, seed=0, case pools, подписанный план и квоту. Strict type checks PASS, включая негативные примеры без revision, boolean вместо wire value и projectIds вместо контракта распределения. Checked by build: Angular development build PASS. ESLint: 0 errors, 6 прежних warnings. Полная проверка форматирования выполняется locked Prettier 3.8.3 с LF, как в Linux CI; обычный Windows checkout содержит CRLF и дает посторонние style предупреждения без изменения содержания.

Checked in browser: D01 prototype отдельно проверен на 320/390/768/1440, состояния и keyboard/focus сохранены в design-handoff. Product UI нового экспертного flow в браузере еще не проверялся, поскольку его реализация ожидает согласования. Backend полный HTTP cycle проверен на локальных КЧ и хакатоне; это отдельный уровень evidence, не frontend browser acceptance.

Осталось: экспертный кабинет/просмотр/форма/результаты и административные экраны после design approval, общие входы BE08/FE08, аналитика/экспорт, QA01/REL01. FE07 и общая новая сущность не отмечаются завершенными.
