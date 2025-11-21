/** @format */

import { TaskPreview } from "./task.model";

export interface Column {
  id: number;
  tasks: TaskPreview[];
  order: number;
  // TODO: добавить даты создания и удаления
}
