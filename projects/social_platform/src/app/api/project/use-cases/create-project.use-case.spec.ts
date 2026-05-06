/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CreateProjectUseCase } from "./create-project.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Project } from "@domain/project/project.model";
import { EventBus } from "@domain/shared/event-bus";
import { projectCreated } from "@domain/project/events/project-created.event";

describe("CreateProjectUseCase", () => {
  let useCase: CreateProjectUseCase;
  let repo: jasmine.SpyObj<ProjectRepositoryPort>;
  let bus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRepositoryPort>("ProjectRepositoryPort", ["postOne"]);
    bus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        CreateProjectUseCase,
        { provide: ProjectRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: bus },
      ],
    });
    useCase = TestBed.inject(CreateProjectUseCase);
  }

  it("делегирует в postOne без аргументов", () => {
    setup();
    repo.postOne.and.returnValue(of({} as Project));

    useCase.execute().subscribe();

    expect(repo.postOne).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok с проектом и эмитит projectCreated", done => {
    setup();
    const project = { id: 1 } as Project;
    repo.postOne.and.returnValue(of(project));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(project);
      expect(bus.emit).toHaveBeenCalledOnceWith(projectCreated(project));
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' } и не эмитит", done => {
    setup();
    repo.postOne.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      expect(bus.emit).not.toHaveBeenCalled();
      done();
    });
  });
});
