/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteResourceUseCase } from "./delete-resource.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";

describe("DeleteResourceUseCase", () => {
  let useCase: DeleteResourceUseCase;
  let repo: any;

  function setup(): void {
    repo = { deleteResource: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        DeleteResourceUseCase,
        { provide: ProjectResourceRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(DeleteResourceUseCase);
  }

  it("делегирует (projectId, resourceId) в deleteResource", () => {
    setup();
    repo.deleteResource.mockReturnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deleteResource).toHaveBeenCalledExactlyOnceWith(1, 42);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteResource.mockReturnValue(of(undefined));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteResource.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
