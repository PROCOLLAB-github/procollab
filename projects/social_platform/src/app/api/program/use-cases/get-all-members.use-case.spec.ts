/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetAllMembersUseCase } from "./get-all-members.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { User } from "@domain/auth/user.model";

describe("GetAllMembersUseCase", () => {
  let useCase: GetAllMembersUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", ["getAllMembers"]);
    TestBed.configureTestingModule({
      providers: [GetAllMembersUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetAllMembersUseCase);
  }

  const page: ApiPagination<User> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (programId, skip, take) в репозиторий", () => {
    setup();
    repo.getAllMembers.and.returnValue(of(page));

    useCase.execute(1, 0, 20).subscribe();

    expect(repo.getAllMembers).toHaveBeenCalledOnceWith(1, 0, 20);
  });

  it("при успехе возвращает ok с пагинацией участников", done => {
    setup();
    repo.getAllMembers.and.returnValue(of(page));

    useCase.execute(1, 0, 20).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.getAllMembers.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(1, 0, 20).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
