/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectInfoResolver, ProjectProgramAnswersResolver } from "./info.resolver";
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  RouterStateSnapshot,
  provideRouter,
} from "@angular/router";
import { firstValueFrom, Observable, of } from "rxjs";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";
import { GetProgramLinkFieldsUseCase } from "@api/project/use-cases/get-program-link-fields.use-case";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import type { ProgramFieldAnswer } from "@domain/project/program-link-fields.model";
import { fail, ok } from "@domain/shared/result.type";

describe("ProjectInfoResolver", () => {
  const mockRoute = {
    paramMap: convertToParamMap({ projectId: 1 }),
  } as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetVacanciesUseCase,
          useValue: { execute: () => of({ ok: true, value: [] }) },
        },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectInfoResolver(mockRoute, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});

describe("ProjectProgramAnswersResolver", () => {
  const execute = vi.fn<GetProgramLinkFieldsUseCase["execute"]>();
  const snapshot = programLinkFields();
  const routerState = {} as RouterStateSnapshot;

  beforeEach(() => {
    execute.mockReset().mockReturnValue(of(ok(snapshot)));
    TestBed.configureTestingModule({
      providers: [{ provide: GetProgramLinkFieldsUseCase, useValue: { execute } }],
    });
  });

  function resolve(linkId?: string): Promise<ProgramFieldAnswer[]> {
    const route = {
      paramMap: convertToParamMap({ projectId: snapshot.projectId }),
      queryParamMap: convertToParamMap({ programLinkId: linkId }),
    } as unknown as ActivatedRouteSnapshot;

    return firstValueFrom(
      TestBed.runInInjectionContext(
        () => ProjectProgramAnswersResolver(route, routerState) as Observable<ProgramFieldAnswer[]>,
      ),
    );
  }

  it("does not load private answers from a public project URL without a program link", async () => {
    expect(await resolve()).toEqual([]);
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns only the authorized snapshot for the requested project and program link", async () => {
    expect(await resolve("700")).toEqual(snapshot.fields);
    expect(execute).toHaveBeenCalledExactlyOnceWith(700);
    execute.mockReturnValue(of(ok(programLinkFields({ projectId: 9 }))));
    expect(await resolve("700")).toEqual([]);
    execute.mockReturnValue(of(ok(programLinkFields({ programLinkId: 701 }))));
    expect(await resolve("700")).toEqual([]);
    execute.mockReturnValue(of(fail({ kind: "server" })));
    expect(await resolve("700")).toEqual([]);
  });
});
