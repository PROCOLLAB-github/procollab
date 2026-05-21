/** @format */

import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

/** Фасад вкладки чата проекта: жизненный цикл (init/destroy). */
@Injectable()
export class ProjectsDetailChatService {
  private readonly destroy$ = new Subject<void>();

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
