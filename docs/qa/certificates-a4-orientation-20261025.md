<!-- @format -->

# Certificate A4 orientation — verification 2026-10-25

Scope: portrait and landscape A4 in the existing certificate editor. Product
Mont, compact 32px controls and the existing management layout are retained.
The orientation select is 164 × 32px, matching the scale control. It lives with
background settings and is separated from upload controls by the existing divider.

## Behavior

- Manual orientation changes update the physical size label and canvas aspect ratio.
- Uploading a portrait background switches a landscape draft to portrait. Undo and
  redo restore both the file and orientation. Square images retain the current choice.
- Orientation is saved in the draft and issuance snapshot. Missing legacy values
  default to landscape. Older clients cannot overwrite a saved portrait orientation
  merely by omitting the field.
- Text fitting, proportional signature resizing, zoom and PDF use the selected page
  dimensions. Percent-based element placement is retained when changing orientation.
- Backgrounds use contain, preserving every edge; images with another aspect ratio
  can leave white margins. Portrait upload normalization preserves 2480 × 3508 images.
- Expanded portrait preview has a 360px target minimum height, constrained by width,
  to avoid a tiny page on a 720px-high desktop. The existing modal scroll and sticky
  save footer keep the remaining tools accessible.

## Verification

- 30 targeted Angular component/layout tests pass, including orientation save/history,
  automatic background orientation, portrait text fit and signature proportions.
- Angular development build succeeds. Targeted ESLint, Stylelint, Prettier and
  `git diff --check` pass.
- Backend certificate suite: 31 tests, 29 pass and 2 PostgreSQL locking tests skip on
  isolated local SQLite. Native WeasyPrint tests verify one-page A4 portrait,
  landscape and legacy snapshots; field validation and old-client saves are covered.
- Actual Angular build + Django API on disposable localhost program 1: saved portrait
  and reloaded, downloaded both preview orientations, uploaded portrait from landscape,
  used undo/redo, inspected expanded editor and 390/320 layouts. Document width stays
  within the viewport and the long preview name remains inside its box.
- Downloaded PDF MediaBoxes are 210 × 297mm and 297 × 210mm, one page each. Poppler
  renders were inspected: all four background corner marks remain visible.

Evidence is outside Git in
`design-artifacts/program-certificate-orientation-20261025/`: browser/PDF JSON,
desktop/mobile screenshots, downloaded previews and rendered PNGs.

Local Windows native rendering needed an isolated GTK DLL search path because the
bundled Poppler provides a different Fontconfig DLL. No application/deployment
environment change is required; the backend uses its existing native PDF stack.

No real dev program was modified, no issuance was activated, and no participant
email was sent. Native touch and other browser engines were not exercised. Deploy
the paired API PR before the frontend PR; no database migration is required.
