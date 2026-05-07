/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateResourceUseCase } from "./update-resource.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { Resource, ResourceDto } from "@domain/project/resource.model";

describe("UpdateResourceUseCase", () => {
  let useCase: UpdateResourceUseCase;
  let repo: jasmine.SpyObj<ProjectResourceRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectResourceRepositoryPort>("ProjectResourceRepositoryPort", [
      "updateResource",
    ]);
    TestBed.configureTestingModule({
      providers: [
        UpdateResourceUseCase,
        { provide: ProjectResourceRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(UpdateResourceUseCase);
  }

  const params = {} as Omit<ResourceDto, "projectId">;

  it("делегирует (projectId, resourceId, params) в updateResource", () => {
    setup();
    repo.updateResource.and.returnValue(of({} as Resource));

    useCase.execute(1, 42, params).subscribe();

    expect(repo.updateResource).toHaveBeenCalledOnceWith(1, 42, params);
  });

  it("при успехе возвращает ok с ресурсом", done => {
    setup();
    const resource = {} as Resource;
    repo.updateResource.and.returnValue(of(resource));

    useCase.execute(1, 42, params).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(resource);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'update_project_resource_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.updateResource.and.returnValue(throwError(() => err));

    useCase.execute(1, 42, params).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("update_project_resource_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
