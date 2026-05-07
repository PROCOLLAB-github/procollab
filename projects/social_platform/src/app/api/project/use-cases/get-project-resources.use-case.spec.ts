/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectResourcesUseCase } from "./get-project-resources.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { Resource } from "@domain/project/resource.model";

describe("GetProjectResourcesUseCase", () => {
  let useCase: GetProjectResourcesUseCase;
  let repo: jasmine.SpyObj<ProjectResourceRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectResourceRepositoryPort>("ProjectResourceRepositoryPort", [
      "fetchAll",
    ]);
    TestBed.configureTestingModule({
      providers: [
        GetProjectResourcesUseCase,
        { provide: ProjectResourceRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProjectResourcesUseCase);
  }

  it("делегирует projectId в fetchAll", () => {
    setup();
    repo.fetchAll.and.returnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.fetchAll).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok с массивом ресурсов", done => {
    setup();
    const resources: Resource[] = [];
    repo.fetchAll.and.returnValue(of(resources));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(resources);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_resources_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.fetchAll.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_resources_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
