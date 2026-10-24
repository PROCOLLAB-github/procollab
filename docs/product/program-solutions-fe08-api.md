<!-- @format -->

# FE08: единая страница назначений

Статус: API-слой одного общего входа подготовлен; FE07/FE08 UI по-прежнему ожидает согласования дизайна. Первый выпуск не завершен.

C00 1.4.0 добавляет GET /evaluation/applications/ и ApplicationRef обоих видов. Старая проекция /evaluation/programs/?include=projects остается прежней. Новая страница объединяет реальные назначения на сервере и только затем применяет общий limit/offset; фронт не объединяет два частично загруженных списка. Query использует status/q/program_id/limit/offset. Вкладочные счетчики pending/completed/unavailable возвращает сервер.

Реализованы generated types/fixtures, SolutionRepositoryPort, repository/HTTP adapter и GetCabinetApplicationsUseCase. Сохраняются programId, projectId/programLinkId и solutionId в своих ветках; discriminator legacy_project/solution не преобразуется. Wire test специально использует совпадающие числовые ID двух видов заявки и проверяет, что различие сохраняется после CamelcaseInterceptor. Всего у экспертного API 11 wire tests.

Checked by tests: полный Vitest — 2563 PASS в 466 файлах; после review повторно 11 wire tests и strict C00 types PASS. Проверены общая смешанная страница и отдельный запрос program_id с согласованным ответом сервера. Checked by build: Angular development build PASS. ESLint: 0 errors / 6 прежних warnings. Locked Prettier 3.8.3: 1945 файлов с LF, нарушений нет. C00 1.3 operations/schemas/examples семантически сохранены, 1.4 синхронизирован byte-for-byte в обоих репозиториях. Проверка product UI нового кабинета в браузере еще неприменима: реализация UI не начата до согласования D01. Запущенный backend обеих локальных форм проверен через HTTP/JWT, включая общую пагинацию и совместимую старую проекцию.

Осталось: административные команды с реальными SolutionRef, публикация материалов после уточнения неконкурсного сценария, BE09/FE08 аналитика и выгрузки; сам экспертный UI/результаты и QA01/REL01. Новые заглушки или автоматически включенный режим не добавлялись.
