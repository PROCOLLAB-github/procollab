/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { LoadProjectFilesUseCase } from "./load-project-files.use-case";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ChatFile } from "@domain/chat/chat-message.model";

describe("LoadProjectFilesUseCase", () => {
  let useCase: LoadProjectFilesUseCase;
  let repo: jasmine.SpyObj<ChatRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ChatRepositoryPort>("ChatRepositoryPort", ["loadProjectFiles"]);
    TestBed.configureTestingModule({
      providers: [LoadProjectFilesUseCase, { provide: ChatRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(LoadProjectFilesUseCase);
  }

  it("делегирует projectId в репозиторий", () => {
    setup();
    repo.loadProjectFiles.and.returnValue(of([]));

    useCase.execute(42).subscribe();

    expect(repo.loadProjectFiles).toHaveBeenCalledOnceWith(42);
  });

  it("при успехе возвращает ok со списком файлов", done => {
    setup();
    const files = [{ id: 1 }] as unknown as ChatFile[];
    repo.loadProjectFiles.and.returnValue(of(files));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(files);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'server_error' }", done => {
    setup();
    repo.loadProjectFiles.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("server_error");
      done();
    });
  });
});
