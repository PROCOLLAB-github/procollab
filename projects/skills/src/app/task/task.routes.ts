/** @format */
import { Routes } from "@angular/router";
import { TaskComponent } from "./task/task.component";
import { SubtaskComponent } from "./subtask/subtask.component";
import { TaskCompleteComponent } from "./complete/complete.component";
import { taskDetailResolver } from "./task.resolver";
import { taskCompleteResolver } from "./complete/complete.resolver";

export const TASK_ROUTES: Routes = [
  {
    path: ":taskId",
    component: TaskComponent,
    resolve: {
      data: taskDetailResolver,
    },
    children: [
      {
        path: "results",
        component: TaskCompleteComponent,
        resolve: {
          data: taskCompleteResolver,
        },
      },
      {
        path: ":subTaskId",
        component: SubtaskComponent,
      },
    ],
  },
];
