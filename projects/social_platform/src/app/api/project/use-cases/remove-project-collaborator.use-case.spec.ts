/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RemoveProjectCollaboratorUseCase } from "./remove-project-collaborator.use-case";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { removeProjectCollaborator } from "@domain/project/events/remove-project-collaborator.event";

describe("RemoveProjectCollaboratorUseCase", () => {
  let useCase: RemoveProjectCollaboratorUseCase;
  let repo: any;
  let bus: any;

  function setup(): void {
    repo = { deleteCollaborator: vi.fn() };
    bus = { emit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        RemoveProjectCollaboratorUseCase,
        { provide: ProjectCollaboratorsRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: bus },
      ],
    });
    useCase = TestBed.inject(RemoveProjectCollaboratorUseCase);
  }

  it("делегирует (projectId, userId) в deleteCollaborator", () => {
    setup();
    repo.deleteCollaborator.mockReturnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deleteCollaborator).toHaveBeenCalledExactlyOnceWith(1, 42);
  });

  it("при успехе возвращает ok с userId и эмитит removeProjectCollaborator", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteCollaborator.mockReturnValue(of(undefined));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(42);
        expect(bus.emit).toHaveBeenCalledExactlyOnceWith(removeProjectCollaborator(1, 42));
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'remove_project_collaborator_error' } и не эмитит", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.deleteCollaborator.mockReturnValue(throwError(() => err));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("remove_project_collaborator_error");
          expect(result.error.cause).toBe(err);
        }
        expect(bus.emit).not.toHaveBeenCalled();
        done();
      });
    }));
});
