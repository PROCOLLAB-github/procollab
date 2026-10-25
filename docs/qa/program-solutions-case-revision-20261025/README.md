<!-- @format -->

# BE08A/FE API: история административной смены кейса

25.10.2026. Product frontend74037240c7f10687b24b5627472e5225fb58a381, backend91fdbc3f6199d6e0b861caa23063766afd18a385. C001.17.0:131 schemas/51 operations/230 независимых сценариев; три общих файла byte-identical. [Модель и backend evidence](https://github.com/PROCOLLAB-github/api/blob/7656b472e263d5e28539a02ea44c2250944c6efb/docs/qa/program-solutions-case-revision-20261025/README.md).

Generated DTO, port/repository/adapter и два use cases читают историю в контексте program/solution/change. Query limit/offset, null snapshots draft, actor/ref, старый/новый snapshot и ошибки сохраняются через настоящий interceptor/HttpTestingController. Некорректные IDs не отправляются в сеть; ошибок не сопровождает automatic retry. Strict types отделяют SolutionRef от Project и требуют эффекты case preview.

49 case/history wire tests PASS, включая16 новых history tests. Backend проверяет unknown query у history detail; frontend detail client не принимает произвольные query, поэтому этот негативный сценарий не выдается за такой wire request. Полный frontend:2862 tests/481 files +strict C00 types, development build/scoped ESLint/locked Prettier3.8.3 по2020 source files PASS до добавления этого отчета.

Настоящий backend HTTP:56 responses/23 request bodies по C00, КЧ35/решение51 и хакатон36/решение52. После сдачи и закрытия срока сохраняются материалы/0/false/состав/оценки, исходный snapshot доступен организатору в истории; снимается только несовместимое неоцененное назначение. Legacy context34 остается Project4/link3; новые solution paths там закрыты. Прежние22 выбранные доменные модели сохранены, новых Project=0.

Это API integration, новый organizer layout/routes/SCSS не добавлялись. Новый интерфейс зависит от ранее запрошенного D02 approval. Исключение участников, удаление регистрации/архив заявки, остальные screens/полный QA01/REL01 остаются в объеме первого выпуска. Backend/миграция0035 предшествуют frontend; реальных программ/merge/deploy/переноса не было.
