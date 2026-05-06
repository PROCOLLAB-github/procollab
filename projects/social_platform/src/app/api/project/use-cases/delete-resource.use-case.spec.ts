/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteResourceUseCase } from "./delete-resource.use-case";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";

describe("DeleteResourceUseCase", () => {
  let useCase: DeleteResourceUseCase;
  let repo: jasmine.SpyObj<ProjectResourceRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectResourceRepositoryPort>("ProjectResourceRepositoryPort", [
      "deleteResource",
    ]);
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
    repo.deleteResource.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deleteResource).toHaveBeenCalledOnceWith(1, 42);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.deleteResource.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeTrue();
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.deleteResource.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
