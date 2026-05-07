/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetMembersUseCase } from "./get-members.use-case";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("GetMembersUseCase", () => {
  let useCase: GetMembersUseCase;
  let repo: jasmine.SpyObj<MemberRepositoryPort>;

  const page: ApiPagination<User> = { count: 0, results: [], next: "", previous: "" };

  function setup(): void {
    repo = jasmine.createSpyObj<MemberRepositoryPort>("MemberRepositoryPort", ["getMembers"]);
    TestBed.configureTestingModule({
      providers: [GetMembersUseCase, { provide: MemberRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetMembersUseCase);
  }

  it("делегирует вызов с skip/take/params", () => {
    setup();
    repo.getMembers.and.returnValue(of(page));

    useCase.execute(0, 10, { role: "expert" }).subscribe();

    expect(repo.getMembers).toHaveBeenCalledOnceWith(0, 10, { role: "expert" });
  });

  it("передаёт undefined вместо params, если их не передали", () => {
    setup();
    repo.getMembers.and.returnValue(of(page));

    useCase.execute(0, 10).subscribe();

    expect(repo.getMembers).toHaveBeenCalledOnceWith(0, 10, undefined);
  });

  it("при успехе возвращает ok со страницей участников", done => {
    setup();
    repo.getMembers.and.returnValue(of(page));

    useCase.execute(0, 10).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_members_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getMembers.and.returnValue(throwError(() => boom));

    useCase.execute(0, 10).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_members_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
