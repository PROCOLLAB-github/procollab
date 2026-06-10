/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetColumnTasksUseCase } from "./get-column-tasks.use-case";
import { KanbanRepositoryPort } from "@domain/kanban/ports/kanban.repository.port";
import { Column } from "@domain/kanban/column.model";

describe("GetColumnTasksUseCase", () => {
  let useCase: GetColumnTasksUseCase;
  let repo: any;

  function setup(): void {
    repo = { getTasksByColumnId: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetColumnTasksUseCase, { provide: KanbanRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetColumnTasksUseCase);
  }

  it("делегирует columnId в репозиторий", () => {
    setup();
    repo.getTasksByColumnId.mockReturnValue(of({} as Column));

    useCase.execute(7).subscribe();

    expect(repo.getTasksByColumnId).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("при успехе возвращает ok с колонкой", () =>
    new Promise<void>(done => {
      setup();
      const column = { id: 7 } as Column;
      repo.getTasksByColumnId.mockReturnValue(of(column));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(column);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getTasksByColumnId.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
