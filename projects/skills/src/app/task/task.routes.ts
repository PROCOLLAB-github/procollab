/** @format */
import { Routes } from "@angular/router";
import { TaskComponent } from "./task/task.component";
import { SubtaskComponent } from "./subtask/subtask.component";
import { TaskCompleteComponent } from "./complete/complete.component";

export const TASK_ROUTES: Routes = [
  {
    path: ":taskId",
    component: TaskComponent,
    children: [
      {
        path: "results",
        component: TaskCompleteComponent,
      },
      { path: ":subTaskId", component: SubtaskComponent },
    ],
  },
];
