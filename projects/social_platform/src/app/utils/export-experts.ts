/** @format */

import type { SheetData } from "write-excel-file/browser";

export interface ExpertExportRow {
  name: string;
  email: string;
  cases: string;
  status: string;
  delivery: string;
  assigned: number | null;
  completed: number | null;
  remaining: number | null;
}

/** Весь отфильтрованный состав, без ограничения текущей страницей таблицы. */
export async function exportExperts(
  programId: number,
  rows: readonly ExpertExportRow[],
): Promise<void> {
  const headers = [
    "№",
    "Эксперт",
    "Почта",
    "Кейсы",
    "Статус",
    "Отправка приглашения",
    "Назначено",
    "Оценено",
    "Осталось",
  ];
  const countCell = (value: number | null) =>
    value === null ? { type: String, value: "" } : { type: Number, value };
  const data: SheetData = [
    headers.map(value => ({ type: String, value, fontWeight: "bold" })),
    ...rows.map((row, index) => [
      { type: Number, value: index + 1 },
      ...[row.name, row.email, row.cases, row.status, row.delivery].map(value => ({
        type: String,
        value,
      })),
      countCell(row.assigned),
      countCell(row.completed),
      countCell(row.remaining),
    ]),
  ];
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  await writeExcelFile(data, {
    sheet: "Эксперты",
    columns: [6, 32, 36, 42, 28, 45, 14, 14, 14].map(width => ({ width })),
  }).toFile(`program-${programId}-experts.xlsx`);
}
