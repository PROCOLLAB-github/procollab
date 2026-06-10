/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CreateResourceUseCase } from "./create-resource.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { Resource, ResourceDto } from "@domain/project/resource.model";

describe("CreateResourceUseCase", () => {
  let useCase: CreateResourceUseCase;
  let repo: any;

  function setup(): void {
    repo = { createResource: vi.fn() };
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
    repo.createResource.mockReturnValue(of({} as Resource));

    useCase.execute(1, dto).subscribe();

    expect(repo.createResource).toHaveBeenCalledExactlyOnceWith(1, dto);
  });

  it("при успехе возвращает ok с ресурсом", () =>
    new Promise<void>(done => {
      setup();
      const resource = {} as Resource;
      repo.createResource.mockReturnValue(of(resource));

      useCase.execute(1, dto).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(resource);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'create_project_resource_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.createResource.mockReturnValue(throwError(() => err));

      useCase.execute(1, dto).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("create_project_resource_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
