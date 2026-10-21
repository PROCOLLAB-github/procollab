/** @format */
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ApiService, LoggerService } from "@corelib";
import { Subject } from "rxjs";
import { ProgramDetailMainUIInfoService } from "../../program/facades/detail/ui/program-detail-main-ui-info.service";
import { ExportFileInfoService } from "./export-file-info.service";
import { saveFile } from "@utils/export-file";

vi.mock("@utils/export-file", () => ({ saveFile: vi.fn() }));

describe("Consolidated program download", () => {
  const program = signal<{ id: number; name: string } | null>({ id: 12, name: "Программа" });
  let response: Subject<Blob>;
  let state: ExportFileInfoService;
  const api = { getFile: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    program.set({ id: 12, name: "Программа" });
    response = new Subject<Blob>();
    api.getFile.mockReturnValue(response);
    TestBed.configureTestingModule({
      providers: [
        ExportFileInfoService,
        { provide: ApiService, useValue: api },
        { provide: LoggerService, useValue: { error: vi.fn() } },
        { provide: ProgramDetailMainUIInfoService, useValue: { program } },
      ],
    });
    state = TestBed.inject(ExportFileInfoService);
  });

  it("requests the program scoped workbook once and preserves the requested file name", () => {
    state.downloadProgram();
    state.downloadProgram();
    expect(api.getFile).toHaveBeenCalledExactlyOnceWith("/programs/12/project-analytics/export/");
    expect(state.loadingExports$().status).toBe("loading");
    program.set({ id: 13, name: "Другая программа" });
    const blob = new Blob(["workbook"]);
    response.next(blob);
    response.complete();
    expect(saveFile).toHaveBeenCalledExactlyOnceWith(blob, "program", "Программа");
    expect(state.loadingExports$().status).toBe("success");
  });

  it("allows a retry after a download error", () => {
    state.downloadProgram();
    response.error(new Error("network"));
    expect(state.loadingExports$().status).toBe("failure");
    expect(saveFile).not.toHaveBeenCalled();
    api.getFile.mockReturnValue(new Subject<Blob>());
    state.downloadProgram();
    expect(api.getFile).toHaveBeenCalledTimes(2);
  });

  it("does not request before the program is available", () => {
    program.set(null);
    state.downloadProgram();
    expect(api.getFile).not.toHaveBeenCalled();
  });
});
