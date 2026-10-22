/** @format */

import { exportExperts, ExpertExportRow } from "./export-experts";
import type { SheetData } from "write-excel-file/browser";

const { writer, toFile } = vi.hoisted(() => {
  const toFile = vi.fn().mockResolvedValue(undefined);
  return {
    toFile,
    writer: vi.fn<(rows: SheetData, options: unknown) => { toFile: typeof toFile }>(() => ({
      toFile,
    })),
  };
});
vi.mock("write-excel-file/browser", () => ({ default: writer }));

describe("Выгрузка экспертов", () => {
  beforeEach(() => {
    writer.mockClear();
    toFile.mockReset().mockResolvedValue(undefined);
  });
  const row: ExpertExportRow = {
    name: "=1+1",
    email: "+expert@example.test",
    cases: "Сбер, Т-Банк",
    status: "Доступ предоставлен",
    delivery: "",
    assigned: 2,
    completed: 0,
    remaining: 2,
  };

  it("создает XLSX с literal строками, числовыми нулями и пустыми счетчиками приглашений", async () => {
    await exportExperts(42, [
      row,
      {
        ...row,
        name: "",
        status: "Ожидает принятия",
        assigned: null,
        completed: null,
        remaining: null,
      },
    ]);
    const data = writer.mock.calls[0][0];
    expect(data).toHaveLength(3);
    expect(data[0]).toHaveLength(9);
    expect(data[1][1]).toEqual({ type: String, value: "=1+1" });
    expect(data[1][2]).toEqual({ type: String, value: "+expert@example.test" });
    expect(data[1][7]).toEqual({ type: Number, value: 0 });
    expect(data[2][7]).toEqual({ type: String, value: "" });
    expect(toFile).toHaveBeenCalledWith("program-42-experts.xlsx");
  });

  it("передает ошибку записи для понятного состояния и повторной попытки в UI", async () => {
    toFile.mockRejectedValueOnce(new Error("storage unavailable"));
    await expect(exportExperts(42, [row])).rejects.toThrow("storage unavailable");
  });
});
