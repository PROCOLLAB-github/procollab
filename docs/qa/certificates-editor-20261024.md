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
and Home also change and reset the value. The select remains inside the page at
320/390. Its final visual size is 164 × 32px with 12px type, matching the canvas
tools; the label row is 44px tall on narrow screens. Physical touch and Safari
were not exercised. No API or certificate content change is involved.

### UI consistency revision — 2026-10-25

This is a bounded correction of the approved flow, following feedback on the
whole section's inconsistent proportions. The visual references are the existing
management Experts and Criteria implementations: Mont, 12px controls, compact
32px actions, light containers and the existing UI foundation. The Experts screen
was also opened alongside certificate QA. Form fields keep their normal foundation
geometry; secondary canvas fields receive the existing compact management density.
No Figma screen, global token, shared primitive or API was changed in this pass.

| Priority finding                                                               | Correction                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas mixes 11/12/16px labels and 32/40/44px controls; scale dominates        | Canvas type is 12px, visible tool controls are 32px. Scale is 164px wide. Scoped selectors prevent the foundation's mobile 16px rule from overriding these utilities.           |
| Header actions have an inherited top margin and wrap unpredictably             | Remove the extra action margin, keep alignment actions together, use two equal action columns on narrow editor headers and short visible labels with explicit accessible names. |
| Mobile save actions occupy multiple rows; modal content shows under the footer | Compact labels/padding keep all three actions together. The editor uses its natural content height and the sticky footer covers the dialog's bottom inset.                      |
| Journal filters shrink to 10px while mobile search grows to 16px               | Search and filters use 12px. Filters wrap at narrow widths instead of shrinking their type.                                                                                     |
| Email textarea uses a pill-like radius and audience labels are too heavy       | Use the neighboring management textarea's modest radius and a 600 weight for audience labels.                                                                                   |

The PDF, test-mail and launch actions have stable compact labels. Adjacent help
explicitly explains save-before-action when the template is dirty. The expanded
fit mode reserves room for tools, the PDF action and the save footer, including
1280 × 720. The required-name lock has accessible text without squeezing its label.
Required-name protection, optional
layers, zoom values, draft/history and separate issuance confirmation are unchanged.

Verification: targeted Stylelint/Prettier and diff checks, the 26 relevant component
and layout tests, Angular build and actual Angular/Django browser checks. The full
template, issuance settings and delivery journal are reviewed together, including
320/390 narrow layouts, 1030 intermediate and 1440 wide layouts. Updated full-view
evidence: [editor](certificates-editor-20261024/desktop.jpg),
[mobile editor](certificates-editor-20261024/mobile.jpg),
[template in page context](certificates-editor-20261024/template-page.jpg),
[issuance settings](certificates-editor-20261024/automation.jpg),
[mobile issuance settings](certificates-editor-20261024/mobile-automation.jpg),
[delivery journal](certificates-editor-20261024/deliveries.jpg).

### Outline button focus adjustment

Certificate secondary buttons keep the focus outline on their existing contour
instead of adding a separate outer ring. Keyboard focus has a 2px inset outline,
the existing light accent fill and dark text. The ordinary state keeps its 1px
border. Other button variants and the global Button foundation are unchanged.
The preview button was checked before and after Tab: its dimensions remain the
same, focus stays visible, and there is no second contour. The focused preview
state is included in the separate keyboard evidence. This CSS-only adjustment was
verified with the Angular build, targeted Stylelint, diff check and browser states;
the behavioral test suite was not rerun for this styling change.
Desktop keyboard state: [focused preview button](certificates-editor-20261024/button-focus-desktop.jpg).

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
