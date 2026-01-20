/** @format */

import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class ProjectsDetailChatService {
  private readonly destroy$ = new Subject<void>();

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
