/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CreateResourceUseCase } from "./create-resource.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { Resource, ResourceDto } from "@domain/project/resource.model";

describe("CreateResourceUseCase", () => {
  let useCase: CreateResourceUseCase;
  let repo: jasmine.SpyObj<ProjectResourceRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectResourceRepositoryPort>("ProjectResourceRepositoryPort", [
      "createResource",
    ]);
    TestBed.configureTestingModule({
      providers: [
        CreateResourceUseCase,
        { provide: ProjectResourceRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(CreateResourceUseCase);
  }

  const dto = {} as Omit<ResourceDto, "projectId">;

  it("делегирует (projectId, params) в createResource", () => {
    setup();
    repo.createResource.and.returnValue(of({} as Resource));

    useCase.execute(1, dto).subscribe();

    expect(repo.createResource).toHaveBeenCalledOnceWith(1, dto);
  });

  it("при успехе возвращает ok с ресурсом", done => {
    setup();
    const resource = {} as Resource;
    repo.createResource.and.returnValue(of(resource));

    useCase.execute(1, dto).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(resource);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'create_project_resource_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.createResource.and.returnValue(throwError(() => err));

    useCase.execute(1, dto).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("create_project_resource_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
