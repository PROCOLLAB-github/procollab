<!-- @format -->

# BE08C1/FE API: архивное участие и сохраненные материалы

25.10.2026. Frontend productbe380c5aad2f25522149999d709e7a75126a6397, backend product8bb1c28fb9d72ba7981b24e571f8b438deb9b0ab. C00 1.19.0:145 схем/55 операций/272 независимых сценария, три shared files byte-identical. [Контракт/retention scope](https://github.com/PROCOLLAB-github/api/blob/8bb1c28fb9d72ba7981b24e571f8b438deb9b0ab/docs/product/program-solutions-be08-archive.md).

Generated metadata различает участие active/archived и сдачу draft/submitted. Archive snapshot использует captured_at и не имитирует submitted_at. Bulk preview/apply port/repository/adapter/use cases сохраняют ids/proof/effects/errors, проверяют safe/unique selection до сети. Existing list query поддерживает participation active/archived/all. History union дополнен archive и private archive_snapshot, старые case/member payloads сохранены.

Финальный full suite после коррекции архивных mocks:2916 tests/483 files +strict C00 types PASS.103 case/member/archive/history wire tests:33/22/27/21; focused archive/history48 — подмножество. Development build/scoped ESLint/locked Prettier3.8.3 по2030 files PASS до отчета. Build выполнен до fixture-only correction; production source/types неизменны, fixture не используется вне tests. После коррекции readiness/pending/effects финальный full suite повторен.

Настоящий backend HTTP:109 responses/53 request bodies по C00. КЧ40/решения55–56 сняты bulk после сдачи/закрытия срока; хакатон41/draft57 сохранен без submit, создана новая58 с тем же участником; неконкурсная42/draft59 снята после штатной публикации. Материалы/0/false/состав/оценки/регистрации и исходная сдача сохраняются. Старые строки23 моделей и4 case/member events совпали, новых Project=0.391 native solution и152 legacy tests/OK;0037 local-only.

Новый organizer layout/routes/SCSS и навигация архива не добавлялись; backend permissions/read-only snapshot доступны существующим API потребителям. D02/D03 и соответствующие screens остаются в первом выпуске. Удаление регистрации/аудит — следующий BE08C2, полный QA01/REL01 открыт. После первого archive event backend/worker должен сохранять совместимость C00 1.19; archive schema/history не откатывается вниз.

Evidence JSON имеет одинаковые значения с backend report. Git wire содержит11 redacted signed proofs; авторизация/пароли не записывались. HTTP resumed после активации только нового synthetic extra captain18, успешные submit/archive не повторялись. Backend/0037 → frontend; без merge/deploy/реальных переключений/переноса Project.

Финальная locked format проверка с отчетом:2035 files, failures=[].
