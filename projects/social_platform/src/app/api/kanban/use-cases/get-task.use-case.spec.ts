/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetTaskUseCase } from "./get-task.use-case";
import { KanbanRepositoryPort } from "@domain/kanban/ports/kanban.repository.port";
import { TaskDetail } from "@domain/kanban/task.model";

describe("GetTaskUseCase", () => {
  let useCase: GetTaskUseCase;
  let repo: any;

  function setup(): void {
    repo = { getTaskById: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetTaskUseCase, { provide: KanbanRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetTaskUseCase);
  }

  it("делегирует taskId в репозиторий", () => {
    setup();
    repo.getTaskById.mockReturnValue(of({} as TaskDetail));

    useCase.execute(99).subscribe();

    expect(repo.getTaskById).toHaveBeenCalledExactlyOnceWith(99);
  });

  it("при успехе возвращает ok с задачей", () =>
    new Promise<void>(done => {
      setup();
      const task = { id: 99 } as TaskDetail;
      repo.getTaskById.mockReturnValue(of(task));

      useCase.execute(99).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(task);
        done();
      });
    }));

  it("при 404 возвращает fail { kind: 'not_found' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getTaskById.mockReturnValue(throwError(() => ({ status: 404 })));

      useCase.execute(99).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("not_found");
        done();
      });
    }));

  it("при прочих ошибках возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getTaskById.mockReturnValue(throwError(() => ({ status: 500 })));

      useCase.execute(99).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
