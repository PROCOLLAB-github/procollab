/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";

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

  getTaskById(taskId: number) {
    return this.apiService.get(`${this.KANBAN_BOARD_URL}/`);
  }
}
