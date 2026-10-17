<!-- @format -->

# Команда и приглашения: согласование с backend A/B/C

AC D1: DELETE участника использует `/projects/{id}/collaborators/?id={userId}`.
AC D2: формы приглашения, команды и submission показывают безопасные сообщения typed errors.
AC D3: `team_policy.is_frozen` управляет существующими CTA; backend повторно проверяет состояние.
AC D4: передаётся реальный `program_link_id`, без выбора первой связи при неоднозначности.
AC D5: ошибка не удаляет участника из UI; приглашения перечитываются после неудачного accept.

План по слоям: HTTP adapter и port → use-case → существующие facade/component;
доменный snapshot команды и общий mapper ошибок. Проверки: adapter regression,
mapping, multi-link/freeze, существующие facade tests, полный Vitest, build и lint.
Без React, новых экранов и recommendations UI. Развёртывание только после backend C.

Актуализация 16.10.2026: база Angular dev `23663374c72d8ec4fec12b03cb2f46937bb05690`.
Full Vitest проверен после интеграции `ae4a8a0…`; затем dev получил только независимую
SCSS-правку выравнивания названия программы (#425). Она сохранена, связанные
tests и обе сборки повторяются на окончательном head.
Сохранены актуальные member rows, role labels, loading/empty states, формы приглашения
и responsive UI из dev. Единственный merge conflict — импорты team step: нужны и
новый StateComponent, и policy helpers. Дополнительный component regression проверяет,
что server freeze блокирует реальный CTA даже при draft в legacy-связи.
API contract C при переносе на свежий backend dev не менялся.
Detail remove/switch/leave учитывают выбранный `programLinkId` из URL только после
проверки по snapshot links. Leave tests различают link ID 902, program ID 9 и чужую
связь; state conflict сохраняет страницу. InviteCard component test подтверждает:
после freeze смена роли запрещена, pending revoke доступен.

## Проверка и границы

- На исходном D `4401dde0…`: полный Vitest — 402 файла, 1958 tests PASS; после последних
  изменений CTA/context дополнительно 72 targeted tests PASS.
- Checked by build: `npm run build:pr` и `npm run build:prod` PASS.
- `npm run lint:ts`: 0 errors, 6 существующих warnings вне изменённых файлов.
- Prettier всех изменённых/new файлов и `git diff --check` PASS.
- Полный `npm run format:check -- --end-of-line auto` PASS: локальный checkout
  использует Windows CRLF; без этого CLI override Prettier сообщает только EOL
  расхождения. Настройки репозитория и исходные файлы массово не изменялись.
- Checked by source: D1–D5; обработка errors не отображает произвольный backend body;
  delete/edit/revoke изменяют локальные данные только при успешном ответе;
  accept/decline сохраняют существующий refresh после ошибки.
- Browser/реальные DEV роли: не проверены на этой версии, deploy не выполнялся.
  Component tests используют реальные Angular templates в jsdom; это не browser E2E.
- Runner сохраняет три исходных исключения Vitest: `projects.component.spec.ts`,
  `program.component.spec.ts`, `editor-submit-button.directive.spec.ts`.
- Геометрия, typography, CSS, DOM/focus order и дизайн не менялись. Изменены
  существующие disabled/error states. Нового выбора программы при ambiguous
  legacy invite нет: backend вернёт понятную ошибку, автоматически контекст не выбирается.
- Старый API поддерживается для обычных/однозначных операций. Полный snapshot
  `team_policy` требует backend C, включая компактный список проектов пользователя.
- Schema/DB/permissions не меняются в этом PR; backend остаётся enforcement layer.

Повторные tests/build/lint/format на обновлённом head и review AC D1–D5 фиксируются
в PR #392. Результаты исходной версии не заменяют текущую verification.

## DEV rollout 17.10.2026

Angular dev обновился до `e1ef88a353a85677cada45f286078897a6a6c1e8` с панелью
организатора #428. Эта база включена обычным merge без конфликтов. Patch ID diff D
к свежему dev совпадает с ранее проверенной версией: `bac1336a7657c6463a4944f93cddc0859240217f`.
Изменений панели организатора или дополнительных изменений бизнес-логики нет.

Backend C уже развёрнут в составе `09b29bf59155b9cda1a70d8959a6dc5de140ee17`.
Read-only inspection [39035280096](https://github.com/PROCOLLAB-github/api/actions/runs/39035280096)
подтвердила migrations Invite 0004 / PartnerProgram 0019, отсутствие pending migrations
и расхождений backfill, совпадение runtime source и ответ team_policy в трёх GET views.
Права БД, ownership, .env и legacy данные в рамках этой проверки не менялись.

Новые результаты полного Vitest, обеих сборок и static checks перед Angular merge
фиксируются в PR #392. Live browser E2E не подтверждён: browser tool не инициализируется;
HTTP-проверка static assets не заменяет взаимодействие с реальными ролями в браузере.
