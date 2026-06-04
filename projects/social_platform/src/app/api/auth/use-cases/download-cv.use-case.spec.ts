/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DownloadCvUseCase } from "./download-cv.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("DownloadCvUseCase", () => {
  let useCase: DownloadCvUseCase;
  let repo: any;

  function setup(): void {
    repo = { downloadCV: vi.fn() };
    TestBed.configureTestingModule({
      providers: [DownloadCvUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DownloadCvUseCase);
  }

  it("делегирует вызов в репозиторий", () => {
    setup();
    repo.downloadCV.mockReturnValue(of(new Blob()));

    useCase.execute().subscribe();

    expect(repo.downloadCV).toHaveBeenCalledExactlyOnceWith();
  });

  it("при успехе возвращает ok с Blob из репозитория", () =>
    new Promise<void>(done => {
      setup();
      const blob = new Blob(["cv"]);
      repo.downloadCV.mockReturnValue(of(blob));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(blob);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'download_cv_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.downloadCV.mockReturnValue(throwError(() => boom));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("download_cv_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
