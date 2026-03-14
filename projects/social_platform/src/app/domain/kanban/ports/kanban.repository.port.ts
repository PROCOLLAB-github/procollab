/** @format */

import { Observable } from "rxjs";
import { Board } from "../board.model";
import { Column } from "../column.model";
import { TaskDetail } from "../task.model";

/**
 * Порт репозитория канбан-доски.
 * Определяет контракт для работы с досками, колонками и задачами.
 */
export abstract class KanbanRepositoryPort {
  abstract getBoardByProjectId(projectId: number): Observable<Board>;
  abstract getTasksByColumnId(columnId: number): Observable<Column>;
  abstract getTaskById(taskId: number): Observable<TaskDetail>;
}
