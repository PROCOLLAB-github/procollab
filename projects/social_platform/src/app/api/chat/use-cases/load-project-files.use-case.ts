/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ChatFile } from "@domain/chat/chat-message.model";

export type LoadProjectFilesError = { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class LoadProjectFilesUseCase {
  private readonly chatRepository = inject(ChatRepositoryPort);

  execute(projectId: number): Observable<Result<ChatFile[], LoadProjectFilesError>> {
    return this.chatRepository.loadProjectFiles(projectId).pipe(
      map(files => ok<ChatFile[]>(files)),
      catchError(() => of(fail<LoadProjectFilesError>({ kind: "server_error" })))
    );
  }
}
