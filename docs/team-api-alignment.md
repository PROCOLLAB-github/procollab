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

## Проверка и границы

- Checked by tests: полный Vitest — 402 файла, 1958 tests PASS; после последних
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
