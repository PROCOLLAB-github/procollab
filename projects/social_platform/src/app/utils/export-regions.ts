/** @format */

import type { SheetData } from "write-excel-file/browser";
import { ProgramAnalyticsRegion } from "@domain/program/program-analytics.model";

export type RegionExportKind = "project-regions" | "participant-regions";

/** Only already-loaded aggregates are exported. Legacy names remain literal string cells. */
export async function exportRegions(
  kind: RegionExportKind,
  regions: readonly ProgramAnalyticsRegion[],
): Promise<void> {
  const sheetData: SheetData = [
    [
      { type: String, value: "Регион", fontWeight: "bold" },
      {
        type: String,
        value: kind === "project-regions" ? "Количество проектов" : "Количество участников",
        fontWeight: "bold",
      },
    ],
    ...regions.map(region => [
      { type: String, value: region.name },
      { type: Number, value: region.count },
    ]),
  ];
  // Load the browser-only writer on demand; no spreadsheet code in the initial UI bundle.
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  await writeExcelFile(sheetData, {
    sheet: kind === "project-regions" ? "Регионы проектов" : "Регионы участников",
    columns: [{ width: 48 }, { width: 26 }],
  }).toFile(`program-${kind}.xlsx`);
}
