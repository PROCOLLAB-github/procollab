<!-- @format -->

# BE08B/FE API: исключение участника и типы истории

25.10.2026. Frontend product32fe953667f09ed4d15e9c132bd8a8ae2415ccee, backend product1e037afe301792fb168879f3c32c546585610431. C001.18.0:136 схем/53 операции/250 независимых сценариев; три shared files byte-identical. [Backend scope и evidence](https://github.com/PROCOLLAB-github/api/blob/1e037afe301792fb168879f3c32c546585610431/docs/product/program-solutions-be08-member-actions.md).

Generated DTO используют discriminated union change_case/remove_member. Старые case payloads сохранены. Port/repository/adapter и два use case передают выбранного пользователя и точный signed proof, возвращают member/effects/controlled errors. Безопасные program/solution/user IDs проверяются до запроса, ошибки не запускают automatic retry. История читает исключенного Member, draft null snapshots и смешанный список case/member. Strict types требуют token и отделяют SolutionRef от Project.

74 case/member/history wire checks PASS, включая22 новых member и3 history. Unknown-query400 проверяется backend; action client не принимает произвольный query. Invalid user блокируется frontend до сети, missing-token400 отправляется намеренно как invalid request. Полный frontend2887 tests/482 files +strict types, development build/scoped ESLint/locked Prettier3.8.3 по2023 files PASS до отчета.

Настоящий backend HTTP:57 responses/35 request bodies по C00; КЧ38/решение53 и хакатон39/решение54 после сдачи сохраняют материалы/0/false/оценки/назначения/регистрацию/accepted invite. Исключенный теряет private доступ, исходный состав остается в истории. Старые строки23 моделей, включая case revisions1/2, совпали; новых Project=0. Backend371 native solution +152 legacy tests/OK; локальная0036 сохраняет историю, Project handlers не менялись.

Это API integration; новый organizer layout/routes/SCSS не добавлялся, D02 approval уже запрошен. Снятие/архив заявки, удаление регистрации/retention, остальные screens и полный QA01/REL01 остаются в первом выпуске. Backend/миграция0036 предшествуют frontend; без merge/deploy/реальных переключений/переноса Project. Файлы evidence совпадают с backend report;10 signed proof strings скрыты только в Git wire.

Финальная locked format проверка с отчетом:2028 files, failures=[]; sanitized wire форматирован без изменения JSON-значений.
