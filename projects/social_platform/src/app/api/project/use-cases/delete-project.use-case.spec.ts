/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteProjectUseCase } from "./delete-project.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { projectDeleted } from "@domain/project/events/project-deleted.event";

describe("DeleteProjectUseCase", () => {
  let useCase: DeleteProjectUseCase;
  let repo: jasmine.SpyObj<ProjectRepositoryPort>;
  let bus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRepositoryPort>("ProjectRepositoryPort", ["deleteOne"]);
    bus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
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
    repo.deleteOne.and.returnValue(of(undefined));

    useCase.execute(7).subscribe();

    expect(repo.deleteOne).toHaveBeenCalledOnceWith(7);
  });

  it("при успехе возвращает ok<void> и эмитит projectDeleted", done => {
    setup();
    repo.deleteOne.and.returnValue(of(undefined));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBeTrue();
      expect(bus.emit).toHaveBeenCalledOnceWith(projectDeleted(7));
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' } и не эмитит", done => {
    setup();
    const err = new Error("boom");
    repo.deleteOne.and.returnValue(throwError(() => err));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("unknown");
        expect(result.error.cause).toBe(err);
      }
      expect(bus.emit).not.toHaveBeenCalled();
      done();
    });
  });
});
