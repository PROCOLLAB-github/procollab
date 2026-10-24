<!-- @format -->

# Certificate editor — verification 2026-10-24

Implementation: `feat/dev-certificate-editor-usability-20261024`, base dev `3ca4c5ec`.
Paired API: [#821](https://github.com/PROCOLLAB-github/api/pull/821), base dev `562d0727`.
Review scope: required name, ready-made background, optional layers, usable canvas,
save-before-confirmation and explicit launch restrictions. Existing eligibility,
permissions, delivery journal and immutable issued documents remain authoritative.

## Requirement audit

| AC                                           | Evidence                                                                                                                                                                                                                                                                                                 | Verdict                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| AC1: background + personal name only         | Real Angular/Django fixture: background uploaded, only name saved and reloaded, preview downloaded. Two native PDFs from this saved template contain only different Cyrillic names; pypdf confirms identical image bytes, one landscape A4 page each. Poppler PNG inspected for clipping.                | PASS: integration/PDF  |
| AC2: remove/restore eight optional elements  | Browser added and removed all eight individually, saved only name and reloaded. Signature restored with its uploaded file and saved placement; unit/API assertions preserve the full layout.                                                                                                             | PASS: browser/tests    |
| AC3: name required                           | UI has no remove action for name; keyboard handler protects it. Direct invalid hidden-elements PUT returns 400 and leaves revision unchanged.                                                                                                                                                            | PASS: source/tests     |
| AC4: existing draft/batch and old client     | API compatibility tests cover omitted field, legacy show_text and preserved geometry; native legacy renderer runs. Angular normalization does not mark unchanged settings dirty.                                                                                                                         | PASS: tests            |
| AC5: drag, resize, center, history, keyboard | Browser dragged name, centered both axes, resized signature, used undo/redo, ArrowRight/ArrowDown and Delete. Geometry tests cover bounds, center snap, vertical resize, aspect ratio and extreme image ratios. Uploaded image initially fits inside its existing area; file and geometry undo together. | PASS: browser/tests    |
| AC6: long name and responsive canvas         | Browser DOM rectangles at 320/390/1030/1440: text remains inside its box, document width does not exceed viewport. Expanded editor and zoom scroll within canvas viewport. Long name also checked in a native two-line PDF.                                                                              | PASS: browser/PDF      |
| AC7: dirty settings → save → confirmation    | Real audience change produced enabled save-and-continue action, successful PUT and separate confirmation with audience/count/mail/timing. No issuance confirmation or participant mail sent. Unit test asserts activate occurs only after separate confirmation with saved revision.                     | PASS: browser/tests    |
| AC8: save error/retry                        | Parameterized 400/409/500/network tests retain draft, release busy state and suppress confirmation/activate/preview/test-mail. Activation failure remains visible inside its confirmation and retry succeeds.                                                                                            | PASS: component tests  |
| AC9: active/zero/date                        | Real active batch shows Open deliveries, which opens journal; local queue paused for further QA. Missing/before-completion dates show reason; zero recipients covered by component test. Date input exposes associated error and aria-invalid.                                                           | PASS: browser/tests    |
| AC10: permissions                            | Existing manager/foreign program/foreign asset/private download rejection tests included in native backend run. No permission code was relaxed.                                                                                                                                                          | PASS: API tests/source |

## Checks

- Tests: `npm run test:ci -- projects/social_platform/src/app/utils/certificate-layout.spec.ts projects/social_platform/src/app/ui/pages/program/management/certificates/certificates.component.spec.ts` — 26 passed.
- Build: `npm run build:pr` — Angular development build; existing Sass deprecation warnings.
- Checks: ESLint for changed TS, Prettier for changed TS/HTML/Markdown, Stylelint for the two changed SCSS files, `git diff --check`.
- API: `manage.py test partner_programs.tests.test_certificates` with isolated SQLite,
  native WeasyPrint and Mont — 26 tests, 24 passed, 2 PostgreSQL locking tests skipped locally.
  Black/flake8 pass for changed Python files. PostgreSQL is covered by the API PR workflow.
- Native PDF fitting uses actual Mont metrics and available width/height. A discovered
  WeasyPrint flex alignment clipping defect was fixed and the downloaded endpoint PDF re-rendered.
- Mobile fieldset intrinsic width overflow was reproduced, fixed with min-width: 0,
  and rechecked at all four widths.

## Design and accessibility review

The editor uses existing Mont, UI foundation Button/Field/Choice and management
compact controls. No global UI Kit changes. Layers/background are one settings
column; the canvas and selected-element tools are the main workspace. Optional
settings appear for the selected layer. Narrow layout puts the canvas first in DOM
and visual order, tools wrap, and save controls stay visible. Selection is available
from the layer list; keyboard arrows/Shift, resize handle, Delete and undo/redo
offer alternatives to precise dragging. Required name, icon labels and visible focus
are explicit. No unexplained status badge or duplicate primary launch action.

Bounded manual continuity/quality review completed. No unresolved blocker/major finding.
The full-bleed certificate intentionally has no inner document padding; the background
must fill A4. This is an exception to generic cramped-padding diagnostics.

## Evidence and limits

### Zoom control adjustment

The scale control is one labeled UI foundation select: По размеру окна, 125%,
150%, 200%. Separate fit/minus/plus buttons are removed. Browser selection at all
four values scales the paper correctly and restores its original width; ArrowDown
and Home also change and reset the value. At 320/390 the select remains inside the
page and has a 44px touch target. The 26 relevant tests and Angular build passed;
targeted Prettier/Stylelint and diff checks passed. Desktop/mobile evidence below
was refreshed. No API or certificate content change is involved.

Screenshots: [desktop](certificates-editor-20261024/desktop.jpg),
[mobile](certificates-editor-20261024/mobile.jpg),
[launch confirmation](certificates-editor-20261024/confirmation.jpg).
They use disposable localhost program 1 and synthetic fixture data. The text in the
test background is raster artwork, not an extra element added by the renderer.

Actual real dev program 6 was not modified for this verification. Production,
participant email delivery and the updated editor on dev await merge/deploy acceptance.
Native touch gestures and other browser engines were not exercised; pointer/keyboard
behavior was tested in the in-app Chromium browser. PostgreSQL concurrency is not
claimed from SQLite. No migration or regeneration of existing PDFs is required.
