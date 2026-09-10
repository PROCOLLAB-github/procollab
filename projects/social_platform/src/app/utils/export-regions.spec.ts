/** @format */

import { exportRegions } from "./export-regions";
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

describe("exportRegions", () => {
  beforeEach(() => {
    writer.mockClear();
    toFile.mockReset().mockResolvedValue(undefined);
  });

  it.each([
    ["project-regions", "Количество проектов"],
    ["participant-regions", "Количество участников"],
  ] as const)(
    "writes %s as a real workbook with literal names and numeric counts",
    async (kind, header) => {
      await exportRegions(kind, [
        { name: "Набережные Челны", count: 2 },
        { name: "=1+1", count: 0 },
      ]);
      const rows = writer.mock.calls[0][0];
      expect(rows[0]).toEqual([
        expect.objectContaining({ type: String, value: "Регион" }),
        expect.objectContaining({ type: String, value: header }),
      ]);
      expect(rows[1]).toEqual([
        { type: String, value: "Набережные Челны" },
        { type: Number, value: 2 },
      ]);
      expect(rows[2][0]).toEqual({ type: String, value: "=1+1" });
      expect(toFile).toHaveBeenCalledWith(`program-${kind}.xlsx`);
    },
  );

  it("can produce a headers-only workbook and propagates failures for controlled UI handling", async () => {
    await exportRegions("project-regions", []);
    expect(writer.mock.calls[0][0]).toHaveLength(1);
    toFile.mockRejectedValueOnce(new Error("worker unavailable"));
    await expect(exportRegions("project-regions", [])).rejects.toThrow("worker unavailable");
  });
});
