/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RemoveProjectCollaboratorUseCase } from "./remove-project-collaborator.use-case";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { removeProjectCollaborator } from "@domain/project/events/remove-project-collaborator.event";

describe("RemoveProjectCollaboratorUseCase", () => {
  let useCase: RemoveProjectCollaboratorUseCase;
  let repo: jasmine.SpyObj<ProjectCollaboratorsRepositoryPort>;
  let bus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectCollaboratorsRepositoryPort>(
      "ProjectCollaboratorsRepositoryPort",
      ["deleteCollaborator"]
    );
    bus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
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
    repo.deleteCollaborator.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deleteCollaborator).toHaveBeenCalledOnceWith(1, 42);
  });

  it("при успехе возвращает ok с userId и эмитит removeProjectCollaborator", done => {
    setup();
    repo.deleteCollaborator.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(42);
      expect(bus.emit).toHaveBeenCalledOnceWith(removeProjectCollaborator(1, 42));
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'remove_project_collaborator_error' } и не эмитит", done => {
    setup();
    const err = new Error("boom");
    repo.deleteCollaborator.and.returnValue(throwError(() => err));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("remove_project_collaborator_error");
        expect(result.error.cause).toBe(err);
      }
      expect(bus.emit).not.toHaveBeenCalled();
      done();
    });
  });
});
