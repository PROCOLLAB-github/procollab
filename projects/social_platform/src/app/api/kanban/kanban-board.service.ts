/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { TaskDetail } from "../../domain/kanban/task.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class KanbanBoardService {
  private readonly apiService = inject(ApiService);
  private readonly KANBAN_BOARD_URL = "";

  getBoardByProjectId(projectId: number) {
    return this.apiService.get(`${this.KANBAN_BOARD_URL}/`);
  }

  getTasksByColumnId(columnId: number) {
    return this.apiService.get(`${this.KANBAN_BOARD_URL}/`);
  }

  getTaskById(taskId: number): Observable<TaskDetail> {
    return this.apiService.get<TaskDetail>(`${this.KANBAN_BOARD_URL}/`);
  }
}
