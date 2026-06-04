/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteProjectUseCase } from "./delete-project.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { projectDeleted } from "@domain/project/events/project-deleted.event";

describe("DeleteProjectUseCase", () => {
  let useCase: DeleteProjectUseCase;
  let repo: any;
  let bus: any;

  function setup(): void {
    repo = { deleteOne: vi.fn() };
    bus = { emit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        DeleteProjectUseCase,
        { provide: ProjectRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: bus },
      ],
    });
    useCase = TestBed.inject(DeleteProjectUseCase);
  }

  it("делегирует id в deleteOne", () => {
    setup();
    repo.deleteOne.mockReturnValue(of(undefined));

    useCase.execute(7).subscribe();

    expect(repo.deleteOne).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("при успехе возвращает ok<void> и эмитит projectDeleted", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteOne.mockReturnValue(of(undefined));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(true);
        expect(bus.emit).toHaveBeenCalledExactlyOnceWith(projectDeleted(7));
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' } и не эмитит", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.deleteOne.mockReturnValue(throwError(() => err));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("unknown");
          expect(result.error.cause).toBe(err);
        }
        expect(bus.emit).not.toHaveBeenCalled();
        done();
      });
    }));
});
