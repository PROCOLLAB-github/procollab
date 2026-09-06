/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, Subject, throwError } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramLinkFields } from "@domain/project/program-link-fields.model";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import { PROGRAM_CASE_FIELD_NAME } from "@domain/program/program-case-field.const";
import { ProjectAdditionalService } from "./project-additional.service";

describe("ProjectAdditionalService canonical fields", () => {
  let service: ProjectAdditionalService;
  const repo = { getProgramLinkFields: vi.fn(), updateProgramLinkFields: vi.fn() };
  const programRepo = { submitCompettetiveProject: vi.fn() };
  const logger = { error: vi.fn() };
  const caseControl = () => service.getAdditionalForm().get(PROGRAM_CASE_FIELD_NAME)!;

  beforeEach(() => {
    repo.getProgramLinkFields.mockReset().mockReturnValue(of(programLinkFields()));
    repo.updateProgramLinkFields.mockReset().mockReturnValue(of(undefined));
    programRepo.submitCompettetiveProject.mockReset().mockReturnValue(of({}));
    logger.error.mockClear();
    TestBed.configureTestingModule({
      providers: [
        ProjectAdditionalService,
        { provide: ProjectProgramRepositoryPort, useValue: repo },
        { provide: ProgramRepositoryPort, useValue: programRepo },
        { provide: LoggerService, useValue: logger },
      ],
    });
    service = TestBed.inject(ProjectAdditionalService);
  });

  it("keeps one stable form; null case is empty/required and generic saved/default values survive", () => {
    const form = service.getAdditionalForm();
    service.setContext(55, "700", 900);
    expect(repo.getProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700);
    expect(service.getAdditionalForm()).toBe(form);
    expect(caseControl().value).toBe("");
    expect(caseControl().hasError("required")).toBe(true);
    expect(form.value).toEqual({ case: "", track: "Y", note: "", agree: false });
    expect(service.activeProgramLinkId()).toBe(700);
  });

  it.each([undefined, "invalid", "-2", "0", "1.5"])(
    "invalid/absent query %s uses the explicit partnerProgram fallback",
    value => {
      service.setContext(55, value, 700);
      expect(repo.getProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700);
    },
  );

  it("invalid link without fallback never loads or saves", async () => {
    service.setContext(55, "bad");
    expect(service.loadFailed()).toBe(true);
    expect(await firstValueFrom(service.save(700, false))).toMatchObject({ ok: false });
    expect(repo.getProgramLinkFields).not.toHaveBeenCalled();
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
  });

  it("loading is not empty success; retry reuses the same link", () => {
    const response = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields.mockReturnValue(response);
    service.setContext(55, 700);
    expect(service.pending()).toBe(true);
    expect(service.activeProgramLinkId()).toBeNull();
    response.error(new HttpErrorResponse({ status: 500, error: "raw" }));
    expect(service.loadFailed()).toBe(true);
    repo.getProgramLinkFields.mockReturnValue(of(programLinkFields({ fields: [] })));
    service.retry();
    expect(repo.getProgramLinkFields.mock.calls).toEqual([[700], [700]]);
    expect(service.fieldsState().status).toBe("success");
    expect(service.partnerProgramFields()).toEqual([]);
  });

  it.each([{ projectId: 99 }, { programLinkId: 900 }])(
    "rejects mismatched GET identity %j, logs and prevents PUT",
    async mismatch => {
      repo.getProgramLinkFields.mockReturnValue(of(programLinkFields(mismatch)));
      service.setContext(55, 700);
      expect(service.activeProgramLinkId()).toBeNull();
      expect(service.loadFailed()).toBe(true);
      expect(service.partnerProgramFields()).toEqual([]);
      expect(Object.keys(service.getAdditionalForm().controls)).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
      await firstValueFrom(service.save(700, false));
      expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
    },
  );

  it.each([null, undefined, "", "   "])(
    "draft omits empty case %j without suppressing generic values",
    async value => {
      service.setContext(55, 700);
      caseControl().setValue(value);
      expect((await firstValueFrom(service.save(700, false))).ok).toBe(true);
      expect(repo.updateProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700, [
        { fieldId: 6, valueText: "Y" },
        { fieldId: 7, valueText: "" },
        { fieldId: 8, valueText: "false" },
      ]);
      expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
    },
  );

  it("saved case restores and draft changes A to B without reset", async () => {
    const snapshot = programLinkFields();
    snapshot.fields[0].value = "A";
    repo.getProgramLinkFields.mockReturnValue(of(snapshot));
    service.setContext(55, 700);
    expect(caseControl().value).toBe("A");
    await firstValueFrom(service.save(700, false));
    expect(repo.updateProgramLinkFields.mock.calls[0][1][0]).toEqual({
      fieldId: 5,
      valueText: "A",
    });
    caseControl().setValue("B");
    await firstValueFrom(service.save(700, false));
    expect(repo.updateProgramLinkFields.mock.calls[1][1][0]).toEqual({
      fieldId: 5,
      valueText: "B",
    });
    expect(caseControl().value).toBe("B");
    snapshot.fields[0].value = "B";
    service.retry();
    expect(caseControl().value).toBe("B");
  });

  it("empty required case blocks BOTH PUT and submit and becomes touched", async () => {
    service.setContext(55, 700);
    expect((await firstValueFrom(service.save(700, true))).ok).toBe(false);
    expect(caseControl().touched).toBe(true);
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
  });

  it("PUT finishes before submit; both use active A even if fallback B exists", () => {
    service.setContext(55, 700, 900);
    const put = new Subject<void>();
    repo.updateProgramLinkFields.mockReturnValue(put);
    caseControl().setValue("B");
    service.save(700, true).subscribe();
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
    put.next();
    put.complete();
    expect(repo.updateProgramLinkFields.mock.calls[0][0]).toBe(700);
    expect(programRepo.submitCompettetiveProject).toHaveBeenCalledExactlyOnceWith(700);
    expect(service.submitted()).toBe(true);
    expect(service.getAdditionalForm().disabled).toBe(true);
  });

  it("submitted snapshot disables controls and never PUTs", async () => {
    const snapshot = programLinkFields({ submitted: true });
    snapshot.fields[0].value = "B";
    repo.getProgramLinkFields.mockReturnValue(of(snapshot));
    service.setContext(55, 700);
    expect(caseControl().value).toBe("B");
    expect(caseControl().disabled).toBe(true);
    service.setBooleanValue("agree", true);
    service.toggleAdditionalFormValues("checkbox", "agree");
    expect(service.getAdditionalForm().get("agree")?.value).toBe(false);
    await firstValueFrom(service.save(700, false));
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
  });

  it.each([0, 400, 500])(
    "unknown PUT status %s keeps edits and displays controlled text",
    async status => {
      service.setContext(55, 700);
      caseControl().setValue("A");
      repo.updateProgramLinkFields.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status, error: "raw sensitive error" })),
      );
      await firstValueFrom(service.save(700, false));
      expect(caseControl().value).toBe("A");
      expect(service.saveError()).toBe(
        status === 0
          ? "Не удалось сохранить данные. Проверьте подключение и попробуйте ещё раз."
          : status === 500
            ? "Не удалось сохранить дополнительные сведения. Попробуйте ещё раз позже."
            : "Не удалось сохранить дополнительные сведения. Попробуйте ещё раз.",
      );
      expect(service.saveError()).not.toContain("raw");
      expect(service.isSend$().status).toBe("failure");
    },
  );

  it("backend missing-case error stays visible on the control", async () => {
    service.setContext(55, 700);
    caseControl().setValue("A");
    programRepo.submitCompettetiveProject.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { detail: "Выберите кейс перед сдачей проекта." },
          }),
      ),
    );
    await firstValueFrom(service.save(700, true));
    expect(caseControl().touched).toBe(true);
    expect(caseControl().hasError("caseBackend")).toBe(true);
    expect(service.caseError()).toBe("Выберите кейс перед сдачей проекта.");
    expect(service.submitted()).toBe(false);
  });

  it.each(["put", "submit"])(
    "stale case from %s refreshes options without losing generic edits",
    async source => {
      service.setContext(55, 700);
      caseControl().setValue("A");
      service.getAdditionalForm().get("note")?.setValue("unsaved note");
      const fresh = programLinkFields();
      fresh.fields[0].options = ["B"];
      repo.getProgramLinkFields.mockReturnValue(of(fresh));
      const error = new HttpErrorResponse({
        status: 400,
        error: { detail: "Выбранный кейс больше недоступен. Выберите актуальный кейс." },
      });
      (source === "put"
        ? repo.updateProgramLinkFields
        : programRepo.submitCompettetiveProject
      ).mockReturnValue(throwError(() => error));
      await firstValueFrom(service.save(700, true));
      expect(repo.getProgramLinkFields.mock.calls).toEqual([[700], [700]]);
      expect(service.partnerProgramFields()[0].options).toEqual(["B"]);
      expect(caseControl().value).toBe("");
      expect(caseControl().invalid).toBe(true);
      expect(service.caseError()).toBe(
        "Выбранный кейс больше недоступен. Выберите актуальный кейс.",
      );
      expect(service.getAdditionalForm().get("note")?.value).toBe("unsaved note");
      caseControl().setValue("B");
      expect(service.caseError()).toBeNull();
    },
  );

  it("switching relation cancels old GET and never applies B fields to A", () => {
    const old = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields
      .mockReturnValueOnce(old)
      .mockReturnValue(of(programLinkFields({ programLinkId: 900, fields: [] })));
    service.setContext(55, 700);
    service.setContext(55, 900);
    expect(old.observed).toBe(false);
    old.next(programLinkFields());
    expect(service.activeProgramLinkId()).toBe(900);
    expect(service.partnerProgramFields()).toEqual([]);
  });

  it("route mismatch immediately cancels pending PUT and prevents subsequent submit", () => {
    service.setContext(55, 700);
    caseControl().setValue("A");
    const put = new Subject<void>();
    repo.updateProgramLinkFields.mockReturnValue(put);
    service.save(700, true).subscribe();
    service.setContext(null, 900);
    expect(put.observed).toBe(false);
    expect(service.activeProgramLinkId()).toBeNull();
    put.next();
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
  });

  it("destroy unsubscribes pending GET", () => {
    const request = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields.mockReturnValue(request);
    service.setContext(55, 700);
    TestBed.resetTestingModule();
    expect(request.observed).toBe(false);
  });
});
