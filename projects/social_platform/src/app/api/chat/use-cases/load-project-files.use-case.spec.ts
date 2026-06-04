/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { LoadProjectFilesUseCase } from "./load-project-files.use-case";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ChatFile } from "@domain/chat/chat-message.model";

describe("LoadProjectFilesUseCase", () => {
  let useCase: LoadProjectFilesUseCase;
  let repo: any;

  function setup(): void {
    repo = { loadProjectFiles: vi.fn() };
    TestBed.configureTestingModule({
      providers: [LoadProjectFilesUseCase, { provide: ChatRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(LoadProjectFilesUseCase);
  }

  it("делегирует projectId в репозиторий", () => {
    setup();
    repo.loadProjectFiles.mockReturnValue(of([]));

    useCase.execute(42).subscribe();

    expect(repo.loadProjectFiles).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("при успехе возвращает ok со списком файлов", () =>
    new Promise<void>(done => {
      setup();
      const files = [{ id: 1 }] as unknown as ChatFile[];
      repo.loadProjectFiles.mockReturnValue(of(files));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(files);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.loadProjectFiles.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
