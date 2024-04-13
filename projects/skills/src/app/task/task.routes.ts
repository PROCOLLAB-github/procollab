/** @format */
import { Routes } from "@angular/router";
import { TaskComponent } from "./task/task.component";
import { SubtaskComponent } from "./subtask/subtask.component";

export const TASK_ROUTES: Routes = [
  {
    path: ":taskId",
    component: TaskComponent,
    children: [{ path: ":subTaskId", component: SubtaskComponent }],
  },
];
