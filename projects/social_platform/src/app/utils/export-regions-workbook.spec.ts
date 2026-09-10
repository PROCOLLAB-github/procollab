/** @format */

import { unzipSync, strFromU8 } from "fflate";
import { exportRegions } from "./export-regions";

describe("region XLSX workbook integration", () => {
  it("generates a ZIP/OOXML workbook with real string and number cells", async () => {
    let savedBlob!: Blob;
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(blob => {
      savedBlob = blob as Blob;
      return "blob:regions-test";
    });
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    try {
      await exportRegions("participant-regions", [{ name: "Набережные Челны", count: 2 }]);
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(savedBlob);
      });
      const files = unzipSync(new Uint8Array(buffer));
      expect(files["[Content_Types].xml"]).toBeDefined();
      expect(files["xl/workbook.xml"]).toBeDefined();
      const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
      expect(sheet).toContain("<v>2</v>");
      const strings = Object.values(files)
        .map(bytes => strFromU8(bytes))
        .join("");
      expect(strings).toContain("Набережные Челны");
      expect(strings).toContain("Количество участников");
      expect(click).toHaveBeenCalledOnce();
      await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:regions-test"));
      expect(document.querySelector('a[download="program-participant-regions.xlsx"]')).toBeNull();
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
      click.mockRestore();
    }
  });
});
