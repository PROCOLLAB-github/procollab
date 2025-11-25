/** @format */

import { TaskPreview } from "./task.model";

export interface Column {
  id: number;
  name: string;
  order: number;
  tasks: TaskPreview[];
  datetimeCreated: Date;
  datetimeUpdated: Date;
}
