<!-- @format -->

# Certificate text fonts — verification 2026-10-25

Scope: a per-element font selector in the existing certificate canvas. The rest
of the product keeps Mont and the established management controls. Choices are
Mont, PT Serif and Lobster, with bundled Cyrillic faces and no font CDN requests.
The selector is 132 × 32px with 12px type; it wraps with the existing tools on mobile.

## Behavior and compatibility

- Each text box stores `fontFamily`; image signatures cannot use a text font.
- Changing a family preserves geometry and font size and participates in undo/redo.
- Font choice survives save/reload, text moves, resizes and orientation changes.
- Font loading completes before the final text-fit measurement. A load failure is
  shown explicitly. Selection labels and placeholders retain Mont.
- Existing drafts and snapshots use Mont. The API preserves each saved family when
  an older client omits the field and rejects unknown values and arbitrary font URLs.
- Browser WOFF2 files are container conversions of the exact TTFs used for PDF
  measurements and embedding. PT Serif uses 400/700, Lobster its actual 400 face
  without synthetic bold, and Mont the existing 400/600 faces. Font provenance and
  attribution files accompany the assets in both repositories.

## Verification

- 32 Angular component/layout tests pass, including initial selected font, switching,
  history, save payloads, geometry preservation, image and preview restrictions.
- 35 backend certificate tests: 33 pass, 2 PostgreSQL locking tests skip on local
  SQLite. Tests cover per-element round trip, old clients, legacy defaults, rejected
  families, long Cyrillic fitting in all three fonts and both A4 orientations, and
  actual embedded font resources in native WeasyPrint PDF output.
- Angular build, targeted ESLint, Stylelint, Prettier, Black, flake8 and diff checks.
- Actual Angular build and Django API on disposable localhost program 1: switched
  all three families, downloaded preview PDFs, saved/reloaded Lobster and used
  undo/redo. Long-name preview and compact controls checked at desktop and 390/320.
- Six native long-name PDFs (three fonts × two orientations) rendered with Poppler
  and visually inspected. Each has one A4 page, an embedded selected font, intact
  extracted Cyrillic name and no clipped glyphs.

A browser integration check found that `[value]` plus dynamically created options
displayed Mont after reload even though the saved font was Lobster. The selector
now uses the existing Angular forms value accessor and the initial saved selection
has a regression assertion. This was fixed before PR creation.

Evidence is outside Git in `design-artifacts/program-certificate-fonts-20261025/`:
browser/PDF checks, preview PDFs, six long-name renders, desktop/mobile screenshots
and command logs. No real dev data or participant email was changed. Native touch,
other browser engines and delivery activation were not exercised.

Deploy the paired API first, then frontend. No database migration or regeneration
of previously issued PDF files is needed. Custom font-file upload is outside this change.
