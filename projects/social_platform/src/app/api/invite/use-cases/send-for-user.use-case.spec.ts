/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SendForUserUseCase } from "./send-for-user.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { Invite } from "@domain/invite/invite.model";
import { HttpErrorResponse } from "@angular/common/http";

describe("SendForUserUseCase", () => {
  let useCase: SendForUserUseCase;
  let repo: any;

  function setup(): void {
    repo = { sendForUser: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SendForUserUseCase, { provide: InviteRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SendForUserUseCase);
  }

  it("делегирует параметры команды в репозиторий", () => {
    setup();
    repo.sendForUser.mockReturnValue(of({} as Invite));

    useCase.execute({ userId: 1, projectId: 2, role: "member", specialization: "FE" }).subscribe();

    expect(repo.sendForUser).toHaveBeenCalledExactlyOnceWith(1, 2, "member", "FE");
  });

  it("при успехе возвращает ok с приглашением", () =>
    new Promise<void>(done => {
      setup();
      const invite = { id: 1 } as unknown as Invite;
      repo.sendForUser.mockReturnValue(of(invite));

      useCase.execute({ userId: 1, projectId: 2, role: "member" }).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(invite);
        done();
      });
    }));

  it("преобразует HTTP validation в controlled Result без raw cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new HttpErrorResponse({
        status: 400,
        error: { user: ["Пользователь уже состоит в проекте."] },
      });
      repo.sendForUser.mockReturnValue(throwError(() => boom));

      useCase.execute({ userId: 1, projectId: 2, role: "member" }).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toEqual({
            kind: "already_member",
            message: "Пользователь уже состоит в команде проекта.",
          });
        }
        done();
      });
    }));
});
