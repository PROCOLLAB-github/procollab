<!-- @format -->

# Certificate editor and recipient actions — 2026-10-25

Scope: the existing program certificate management UI, preserving Mont and the
product controls. The goal includes clear delivery modes, current template PDFs,
recipient selection and responsive editor access.

## Implemented behavior

- A typed text size applies immediately; the text box grows with it instead of
  silently limiting it to the old height. Size and geometry undo together.
- The full sheet fits the workspace. Percentage zoom is removed; the expanded
  editor keeps the sheet and the preview PDF action together.
- The long-name switch is sent to the native preview endpoint.
- Delivery is explicitly “На платформе” or “На платформе и по почте”.
- Step 3 is “Отправление”. The mail column uses “Не отправлено” for a platform PDF
  without email, with an additional unsent filter.
- Checkboxes select individual rows or all matching the current filter on every
  page; individual exclusions are supported. Filter/search changes clear selection.
- Selected send skips sent messages. Refresh updates PDF without email. Retry
  keeps each row's prior delivery mode, including platform-only failures.
- Changed templates have an explicit update-and-download action. Personal files
  and selected archives use the current saved template and keep participant links.

## Verified locally

- 46 Angular component/layout/participant tests, dev build and targeted ESLint/Stylelint/Prettier.
- Paired API: 48 certificate tests, 45 passed and 3 PostgreSQL concurrency tests
  skipped on SQLite. The earlier full PostgreSQL CI passed for base API commit
  `04008df927b75c1fa0b4de6a1c29c09f54db251c`; the provenance migration follow-up
  requires its own PostgreSQL CI before deployment.
- Actual Angular build and Django API on disposable local program 1: size 16 to
  48 applies immediately; no zoom control; long-name PDF contains the exact name.
- Updated an old personal PDF from the journal: current portrait background and
  selected Lobster face, one A4 page, correct participant name, same secret link.
- Selected all four local rows, excluded one, submitted three: two were queued
  and the already sent row was skipped. Running the real service worker against
  the local locmem email backend produced exactly two emails and generated PDFs;
  repeated processing produced zero duplicate emails. No external mail was sent.
- A selected ZIP contains four one-page portrait PDFs with embedded Lobster,
  including the previously outdated document.
- A platform-only generation failure was retried through the actual browser/API,
  then processed by the service: a PDF was created, the status became `ready`,
  and no mail was produced. The UI distinguishes “PDF не создан” from a mail error.
- A regeneration failure now retains the previous PDF and secret link. API tests
  cover access while queued/failed, successful replacement, provenance backfill
  without file/token/mail changes and program deletion with both batch references.
- PDF refreshes also retain the prior mail delivery date and sent filter. A PDF
  failure/retry cannot turn an already delivered certificate into a new email;
  both the selection API and worker prevent duplicate delivery.
- Native browser widths 390 and 320: the expanded editor computes the remaining
  height below the tools and above the sticky footer; the whole page and PDF
  button are visible. The mobile journal uses stacked rows with mail/PDF labels,
  checkboxes and actions together; no horizontal document or table overflow.

Evidence lives outside Git in `design-artifacts/program-certificates-ux-20261025/`.
Local services use synthetic accounts and do not connect to the real dev database.

## Release gates still to verify

- Provenance follow-up PostgreSQL CI, migration/API/worker deployment, then frontend
  and acceptance on dev program 6.
- Actual external email delivery has not been invoked. Local email checks use
  a capture backend, with the application generation and delivery code.

The earlier font release (API #825 and frontend #508) is deployed and visible on
dev. Its frontend deployment initially failed because the dev disk was full;
cache-only recovery preserved container/image/volume inventories and a rerun
succeeded. This UX change is a separate release and must not be mistaken for it.
