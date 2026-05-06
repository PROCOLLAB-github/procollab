/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetMyInvitesUseCase } from "./get-my-invites.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { Invite } from "@domain/invite/invite.model";

describe("GetMyInvitesUseCase", () => {
  let useCase: GetMyInvitesUseCase;
  let repo: jasmine.SpyObj<InviteRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<InviteRepositoryPort>("InviteRepositoryPort", ["getMy"]);
    TestBed.configureTestingModule({
      providers: [GetMyInvitesUseCase, { provide: InviteRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetMyInvitesUseCase);
  }

  it("вызывает getMy без аргументов", () => {
    setup();
    repo.getMy.and.returnValue(of([]));

    useCase.execute().subscribe();

    expect(repo.getMy).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok со списком приглашений", done => {
    setup();
    const invites = [{ id: 1 }] as unknown as Invite[];
    repo.getMy.and.returnValue(of(invites));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(invites);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_invites_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getMy.and.returnValue(throwError(() => boom));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_invites_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
