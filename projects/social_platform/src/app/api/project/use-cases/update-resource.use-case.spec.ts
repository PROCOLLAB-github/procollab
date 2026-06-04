/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateResourceUseCase } from "./update-resource.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { Resource, ResourceDto } from "@domain/project/resource.model";

describe("UpdateResourceUseCase", () => {
  let useCase: UpdateResourceUseCase;
  let repo: any;

  function setup(): void {
    repo = { updateResource: vi.fn() };
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
    repo.updateResource.mockReturnValue(of({} as Resource));

    useCase.execute(1, 42, params).subscribe();

    expect(repo.updateResource).toHaveBeenCalledExactlyOnceWith(1, 42, params);
  });

  it("при успехе возвращает ok с ресурсом", () =>
    new Promise<void>(done => {
      setup();
      const resource = {} as Resource;
      repo.updateResource.mockReturnValue(of(resource));

      useCase.execute(1, 42, params).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(resource);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'update_project_resource_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.updateResource.mockReturnValue(throwError(() => err));

      useCase.execute(1, 42, params).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("update_project_resource_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
