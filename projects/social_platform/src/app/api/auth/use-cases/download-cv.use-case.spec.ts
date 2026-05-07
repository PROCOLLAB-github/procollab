/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DownloadCvUseCase } from "./download-cv.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("DownloadCvUseCase", () => {
  let useCase: DownloadCvUseCase;
  let repo: jasmine.SpyObj<AuthRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<AuthRepositoryPort>("AuthRepositoryPort", ["downloadCV"]);
    TestBed.configureTestingModule({
      providers: [DownloadCvUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DownloadCvUseCase);
  }

  it("делегирует вызов в репозиторий", () => {
    setup();
    repo.downloadCV.and.returnValue(of(new Blob()));

    useCase.execute().subscribe();

    expect(repo.downloadCV).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok с Blob из репозитория", done => {
    setup();
    const blob = new Blob(["cv"]);
    repo.downloadCV.and.returnValue(of(blob));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(blob);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'download_cv_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.downloadCV.and.returnValue(throwError(() => boom));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("download_cv_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
