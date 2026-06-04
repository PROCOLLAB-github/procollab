/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectResourcesUseCase } from "./get-project-resources.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { Resource } from "@domain/project/resource.model";

describe("GetProjectResourcesUseCase", () => {
  let useCase: GetProjectResourcesUseCase;
  let repo: any;

  function setup(): void {
    repo = { fetchAll: vi.fn() };
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
    repo.fetchAll.mockReturnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.fetchAll).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с массивом ресурсов", () =>
    new Promise<void>(done => {
      setup();
      const resources: Resource[] = [];
      repo.fetchAll.mockReturnValue(of(resources));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(resources);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_resources_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.fetchAll.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_resources_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
