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
  let repo: any;
  let bus: any;

  function setup(): void {
    repo = { postOne: vi.fn() };
    bus = { emit: vi.fn() };
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
    repo.postOne.mockReturnValue(of({} as Project));

    useCase.execute().subscribe();

    expect(repo.postOne).toHaveBeenCalledExactlyOnceWith();
  });

  it("при успехе возвращает ok с проектом и эмитит projectCreated", () =>
    new Promise<void>(done => {
      setup();
      const project = { id: 1 } as Project;
      repo.postOne.mockReturnValue(of(project));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(project);
        expect(bus.emit).toHaveBeenCalledExactlyOnceWith(projectCreated(project));
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' } и не эмитит", () =>
    new Promise<void>(done => {
      setup();
      repo.postOne.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        expect(bus.emit).not.toHaveBeenCalled();
        done();
      });
    }));
});
