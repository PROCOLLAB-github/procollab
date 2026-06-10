/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetBoardUseCase } from "./get-board.use-case";
import { KanbanRepositoryPort } from "@domain/kanban/ports/kanban.repository.port";
import { Board } from "@domain/kanban/board.model";

describe("GetBoardUseCase", () => {
  let useCase: GetBoardUseCase;
  let repo: any;

  function setup(): void {
    repo = { getBoardByProjectId: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetBoardUseCase, { provide: KanbanRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetBoardUseCase);
  }

  it("делегирует projectId в репозиторий", () => {
    setup();
    repo.getBoardByProjectId.mockReturnValue(of({} as Board));

    useCase.execute(42).subscribe();

    expect(repo.getBoardByProjectId).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("при успехе возвращает ok с доской", () =>
    new Promise<void>(done => {
      setup();
      const board = { id: 1 } as Board;
      repo.getBoardByProjectId.mockReturnValue(of(board));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(board);
        done();
      });
    }));

  it("при 404 возвращает fail { kind: 'not_found' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getBoardByProjectId.mockReturnValue(throwError(() => ({ status: 404 })));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("not_found");
        done();
      });
    }));

  it("при прочих ошибках возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getBoardByProjectId.mockReturnValue(throwError(() => ({ status: 500 })));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
