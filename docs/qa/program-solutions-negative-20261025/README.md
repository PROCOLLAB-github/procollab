<!-- @format -->

# QA01 NEG01–NEG08: сдача, сеть и обновление формы

Scope этого checkpoint подтвержден; **общие QA01/REL01 и новая сущность еще не завершены**. [Каноническое ТЗ](https://chatgpt.com/space/page_9632e9ed74588191b6b3e4b397d55175), исходные AC07/09/10/13/14/16/17/24/25. Это не замена полной матрице всех 26 AC.

## Ошибка и исправление

При потере ответа POST после реального commit сервер уже возвращал submitted snapshot по GET, но footer сохранял сообщение «Не удалось загрузить решение. Попробуйте еще раз.». Это воспроизведено на КЧ и хакатоне и подтверждено красным regression test: 1 failed / 16 passed. [Исходный browser результат FAIL](negative-browser-before-fix.json) сохранен с обоими findings.

Теперь принятый hydrate результата GET со status=submitted снимает старую командную ошибку, показывает существующее «Решение сдано.» и убирает причины неполноты/attempted. Код не отправляет повторный POST, не меняет API или данные решения и не вызывает hydrate(saved=true): локальный ввод сохраняется прежним механизмом. Если GET вернул draft или тоже завершился ошибкой, успех не показывается. Более старый ответ не принимается через существующий version guard.

3 новых component tests и усиленный существующий interrupted-POST test проверяют: подтвержденную сдачу, draft после неизвестного результата, ошибку уточняющего GET и сохранение более поздней локальной правки в отдельном блоке копирования. Финальный focused прогон component/facade/form-rebase — 31 PASS. Полный test:ci — 2763 tests/478 files и strict C00 types PASS; development build/scoped ESLint/locked Prettier 3.8.3 по 1984 files PASS. Перед этим полный baseline был 2760/478. Дизайн D00 v3, controls/layout/SCSS, C00 1.13.0 и permissions не менялись.

## Среда и разделение evidence

Backend runtime 2ad4743; 6db9050 меняет только лимит CI. Frontend до исправления 55332ef2, после — текущий source hash в [manifest](local-artifacts.json) и [build provenance](build-provenance-after-fix.json). PostgreSQL 18/main procollab_ci, настоящий Django/JWT/Angular, locmem mail и local storage; внешняя сеть блокировалась. Тестовые пароли/JWT/credential manifests в Git не включены.

До исправления: программы 11/12, сданные контрольные решения 12/13 и проверяемые решения 14/15. После исправления: свежие программы 13/14, контрольные 16/17 и проверяемые 18/19. Все сданные fixtures сохранены. Ни один реальный пользователь/программа/dev/production не переключался, Project не создавался. Дедлайн менялся только guarded helper выбранных synthetic программ и всегда восстанавливался в finally.

Первый negative browser проход продолжался по завершенным фазам после исправления ожидания harness: действующий UI сохраняет кнопку сдачи disabled при закрытом сроке, а не скрывает ее. Два raw phase attempts сохранены. Файл before-fix содержит события последней invocation; более ранние empty/team/material фазы подтверждаются state и [raw attempts](local-artifacts.json). Не заявляется один непрерывный успешный проход всего negative сценария. Product finding — отдельная stale network error после confirmed submit; ее исправление проверено заново на обеих формах свежими fixtures.

## Матрица checkpoint

| Gate  | Проверка и наблюдаемый результат                                                                                                                                                                                                                            | Evidence                                                                      | Verdict        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------- |
| NEG01 | Пустая заявка с одним капитаном и null кейсом сохраняется PATCH 200. Readiness переводит на Team и фокусирует team-title; submit POST не отправляется. Ссылка ошибки кейса возвращает к select с тем же ID.                                                 | negative-state + raw phase attempts; source prepareSubmission/focusIssue      | PASS           |
| NEG02 | Pending не закрывает минимум; после настоящего accept вторым аккаунтом ошибка из Team ведет к required material: PDF button КЧ / repository input хакатона.                                                                                                 | negative state/events/screenshots                                             | PASS           |
| NEG03 | Срок закрывается после PATCH/подтверждения: POST 409/submission_closed, статус остается draft, submit disabled; сохранение draft после срока дает 200. Дата восстановлена.                                                                                  | negative browser/deadline helper + domain                                     | PASS           |
| NEG04 | PATCH прерывается до отправки: локальный textarea остается, серверные ответы прежние. Только явный retry сохраняет текст.                                                                                                                                   | negative-browser faults + events                                              | PASS           |
| NEG05 | Manager PUT меняет labels/order и добавляет required при локальных правках. PATCH со старой form revision дает 409; GET/rebase сохраняет локальные name/text/0/False/case, отличающиеся от прежних server 13/True/«Город». Повтор сохраняет новые значения. | negative browser + manager HTTP + domain                                      | PASS           |
| NEG06 | Новый required блокирует только новую работу и фокусирует новый control из Team. Сданный контрольный snapshot сохраняет прежние definitions/answers/team; manager field filters not_applicable/present/missing различают две сдачи.                         | negative-domain: 24 HTTP/C00 checks                                           | PASS           |
| NEG07 | JSON submit реально коммитится, ответ намеренно теряется. После fix GET показывает submitted/readonly и success notice, stale network alert отсутствует; ровно один UI POST, 0 automatic retries, 0/False сохранены.                                        | unknown-browser-after-fix: обе формы, 2 injected lost responses, JS errors=[] | PASS после fix |
| NEG08 | DB/HTTP verifier подтверждает snapshots/права/повторную сдачу/597-byte PDF/MIME/owner/bytes; прежняя выборка совпадает с baseline SHA-256. Сам verifier не меняет домен.                                                                                    | negative-domain 24 + unknown-domain 18 = 42 HTTP/C00 checks                   | PASS           |

## Файлы и воспроизведение

- [Negative before-fix browser](negative-browser-before-fix.json), [state](negative-state.json), [domain](negative-domain.json), [seed](negative-seed.json), [baseline](negative-baseline.json).
- [Post-fix browser](unknown-browser-after-fix.json), [state](unknown-state.json), [domain](unknown-domain.json), [seed](unknown-seed.json), [baseline](unknown-baseline.json).
- [Manifest исходных артефактов](local-artifacts.json): raw SHA-256/semantic SHA каждого JSON, хеши семи harness sources в Temp и 17 локальных screenshots. Копии JSON приведены к repo Prettier; их значения, включая FAIL before-fix, не менялись.
- Локальные изображения: Z:/Документы/PROCOLLAB-dev/design-artifacts/program-solutions-20261024/qa01-negative и qa01-unknown-submit. Sources/логи: C:/Users/evsee/AppData/Local/Temp/procollab-qa01-\*. Не перезапускать seed/harness вслепую: submitted fixtures неизменяемы, state/phases имеют значение.
- Логи: procollab-qa01-unknown-submit-red.log, procollab-qa01-unknown-submit-focused.log, procollab-qa01-negative-fe-tests.log, procollab-qa01-negative-fe-build.log, procollab-qa01-negative-fe-eslint.log и procollab-qa01-negative-fe-format.log.

Основной путь выполнен на 390 px; final readonly состояния проверены при 320/390/768/1440, отдельно снят desktop. Визуально просмотрены post-fix КЧ mobile и хакатон desktop; Mont загружен. Полный desktop путь, screen reader/zoom/contrast, production CDN и рассылки не заявляются; default remote avatars отсутствуют из-за network guard. Upload идет native multipart прямо в local API, JSON response-loss injection отдельно записан; успех API не подменяется mock body. Seed/browser намеренно меняют только новые synthetic данные; это не zero writes.

## Source audit конкурентности

Прочитаны конкретные assertions backend 2ad4743, а не только имена файлов. Эти tests входили в финальный локальный PostgreSQL прогон 261 PASS; frontend fix backend не меняет.

| Исходный AC | Что доказывают существующие assertions                                                                                                                                                                                               | Остаток                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| AC02        | SolutionCreationConcurrencyTests: два PostgreSQL потока/Barrier возвращают один ID, created=[False,True], одна Solution/Member и ни одного Project.                                                                                  | Не заменяет общий пользовательский QA всех входов.                                                                                      |
| AC07        | validate_submission_team/min использует только accepted; maximum включает unique pending/reserved. API test максимума проверяет team_max_size и прием собственного резерва; browser NEG02 подтверждает минимум.                      | Отдельная гонка последнего места с разными recipients еще требует прямого evidence; duplicate invite same-version race ее не подменяет. |
| AC08        | Два accepted invitations в разные команды дают success/already_in_program_team, у получателя ровно одно членство.                                                                                                                    | Остальные форматы/legacy coexistence сверяются отдельно.                                                                                |
| AC15        | submit×PATCH/remove/accept/form/file delete проверяют допустимые ordered outcomes и точные snapshot/name/member/file invariants. При проигравшем submit остается draft без snapshot; при победившем замороженные данные не меняются. | Полный итог QA01 и остальные edges не закрываются числом tests.                                                                         |

## CI и оставшаяся работа

PostgreSQL run 40164049519 для 2ad4743 отменен по аннотации GitHub «The job has exceeded the maximum execution time of 30m0s»: 39 locking tests прошли, полный набор нашел 1669 tests, но итоговый Ran/OK не получен. Это не PASS. В 6db9050 timeout поднят до 60 минут; YAML diff проверен: triggers/permissions/jobs/полный набор tests сохранены. Новые runs: PostgreSQL 40166190670 и General 40166187673; их terminal verdict проверяется отдельно, старые результаты его не заменяют.

Обновление 25.10.2026: PostgreSQL 40166190670 для текущего 6db9050 завершен SUCCESS; лог подтверждает 39 locking/vacancy tests и полный набор 1669 tests, оба Ran/OK. General 40166187673 также SUCCESS, Tests/Lint, лог Ran 1669/OK (skipped=54) проверен. Прямой last-slot race с разными получателями и invitation UI edges проверены следующим [checkpoint](../program-solutions-invitations-20261025/README.md); это закрывает названный выше частный пробел evidence, сохраняя общий QA01 открытым.

[General CI 2ad4743](https://github.com/PROCOLLAB-github/api/actions/runs/40164045725) SUCCESS: Ran 1669 tests, OK (skipped=54), Tests/Lint, лог проверен. Этот non-PostgreSQL прогон не подменяет locking/full PostgreSQL gate; runtime 6db9050 совпадает с 2ad4743, изменен только CI timeout.

Впереди полные organizer/expert/public/legacy/noncompetitive пути, полный desktop, invitation role bounds/edit/unavailable, прямое evidence last-slot race и оставшиеся исходные AC. D02/D03 и административная политика сданных заявок/конкурсная eligibility ожидают уже заданных решений. Эта проверка их не согласует и не реализует. PR остается draft, merge/deploy не выполнялись.
