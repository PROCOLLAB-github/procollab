/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, throwError } from "rxjs";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import { GetProgramLinkFieldsUseCase } from "./get-program-link-fields.use-case";
import { UpdateProgramLinkFieldsUseCase } from "./update-program-link-fields.use-case";

describe("program-link fields use cases", () => {
  const repository = { getProgramLinkFields: vi.fn(), updateProgramLinkFields: vi.fn() };
  beforeEach(() => {
    repository.getProgramLinkFields.mockReset().mockReturnValue(of(programLinkFields()));
    repository.updateProgramLinkFields.mockReset().mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [{ provide: ProjectProgramRepositoryPort, useValue: repository }],
    });
  });

  it("GET delegates the relation ID and returns a snapshot Result", async () => {
    expect(await firstValueFrom(TestBed.inject(GetProgramLinkFieldsUseCase).execute(700))).toEqual({
      ok: true,
      value: programLinkFields(),
    });
    expect(repository.getProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700);
  });

  it("PUT delegates the relation ID/values and returns void, not a Project", async () => {
    const values = [{ fieldId: 5, valueText: "B" }];
    expect(
      await firstValueFrom(TestBed.inject(UpdateProgramLinkFieldsUseCase).execute(700, values)),
    ).toEqual({ ok: true, value: undefined });
    expect(repository.updateProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700, values);
  });

  it.each([
    [400, "Выберите кейс перед сдачей проекта.", "case_required"],
    [400, "Выбранный кейс больше недоступен. Выберите актуальный кейс.", "case_unavailable"],
    [400, "Срок подачи проектов в программу завершён.", "submission_closed"],
    [400, "Проект уже был сдан на проверку.", "already_submitted"],
    [400, "Программа не является конкурсной.", "not_competitive"],
    [500, "Срок подачи проектов в программу завершён.", "server"],
    [403, "Проект уже был сдан на проверку.", "unknown"],
    [400, "raw unknown error", "unknown"],
    [401, "raw", "unknown"],
    [403, "raw", "unknown"],
    [0, "raw", "network"],
    [500, "Выберите кейс перед сдачей проекта.", "server"],
  ])(
    "maps status %s without relying on arbitrary backend messages",
    async (status, detail, kind) => {
      const error = new HttpErrorResponse({ status, error: { detail } });
      repository.updateProgramLinkFields.mockReturnValue(throwError(() => error));
      repository.getProgramLinkFields.mockReturnValue(throwError(() => error));
      expect(
        await firstValueFrom(TestBed.inject(UpdateProgramLinkFieldsUseCase).execute(700, [])),
      ).toEqual({ ok: false, error: { kind, cause: error } });
      expect(
        await firstValueFrom(TestBed.inject(GetProgramLinkFieldsUseCase).execute(700)),
      ).toEqual({ ok: false, error: { kind, cause: error } });
    },
  );
});
