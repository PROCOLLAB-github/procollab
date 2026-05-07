/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CheckUnreadsUseCase } from "./check-unreads.use-case";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";

describe("CheckUnreadsUseCase", () => {
  let useCase: CheckUnreadsUseCase;
  let repo: jasmine.SpyObj<ChatRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ChatRepositoryPort>("ChatRepositoryPort", ["hasUnreads"]);
    TestBed.configureTestingModule({
      providers: [CheckUnreadsUseCase, { provide: ChatRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(CheckUnreadsUseCase);
  }

  it("делегирует в репозиторий hasUnreads", () => {
    setup();
    repo.hasUnreads.and.returnValue(of(true));

    useCase.execute().subscribe();

    expect(repo.hasUnreads).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok с boolean", done => {
    setup();
    repo.hasUnreads.and.returnValue(of(true));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'server_error' }", done => {
    setup();
    repo.hasUnreads.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("server_error");
      done();
    });
  });
});
