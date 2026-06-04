/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CheckUnreadsUseCase } from "./check-unreads.use-case";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";

describe("CheckUnreadsUseCase", () => {
  let useCase: CheckUnreadsUseCase;
  let repo: any;

  function setup(): void {
    repo = { hasUnreads: vi.fn() };
    TestBed.configureTestingModule({
      providers: [CheckUnreadsUseCase, { provide: ChatRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(CheckUnreadsUseCase);
  }

  it("делегирует в репозиторий hasUnreads", () => {
    setup();
    repo.hasUnreads.mockReturnValue(of(true));

    useCase.execute().subscribe();

    expect(repo.hasUnreads).toHaveBeenCalledExactlyOnceWith();
  });

  it("при успехе возвращает ok с boolean", () =>
    new Promise<void>(done => {
      setup();
      repo.hasUnreads.mockReturnValue(of(true));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.hasUnreads.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
