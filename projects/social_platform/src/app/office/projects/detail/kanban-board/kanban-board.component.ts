/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Subscription } from "rxjs";
import { ProjectDataService } from "../services/project-data.service";
import { Project } from "@office/models/project.model";
import { KanbanBoardSidebarComponent } from "./shared/sidebar/kanban-board-sidebar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { IconComponent } from "@ui/components";
import { KanbanTaskComponent } from "./shared/task/kanban-task.component";
import { ClickOutsideModule } from "ng-click-outside";
import { TaskDetailComponent } from "./shared/task/detail/task-detail.component";
import { DropdownComponent } from "@ui/components/dropdown/dropdown.component";
import { kanbanColumnInfo } from "projects/core/src/consts/other/kanban-column-info.const";

@Component({
  selector: "app-kanban-board",
  templateUrl: "./kanban-board.component.html",
  styleUrl: "./kanban-board.component.scss",
  imports: [
    CommonModule,
    KanbanBoardSidebarComponent,
    IconComponent,
    KanbanTaskComponent,
    ClickOutsideModule,
    TaskDetailComponent,
    DropdownComponent,
  ],
  standalone: true,
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  private readonly projectDataService = inject(ProjectDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private subscriptions: Subscription[] = [];

  projectBoardInfo = signal<Project | null>(null);
  boardColumns = signal<any[]>([]);
  isTaskDetailOpen = signal<boolean>(false);

  isColumnInfoOpen = false;
  selectedColumnId = 0;

  get columnInfoOptions() {
    return kanbanColumnInfo;
  }

  ngOnInit(): void {
    const detailInfoUrl$ = this.route.queryParams.subscribe({
      next: params => {
        if (params["taskId"]) {
          this.isTaskDetailOpen.set(true);
        }
      },
    });

    this.subscriptions.push(detailInfoUrl$);

    const projectInfo$ = this.projectDataService.project$.subscribe({
      next: project => {
        if (project) {
          this.projectBoardInfo.set(project);
        }
      },
    });

    this.subscriptions.push(projectInfo$);

    const mockColumns = [
      {
        id: 0,
        name: "бэклог",
        order: 0,
        locked: true,
        tasks: [
          {
            id: 1,
            title: "собрать требования",
            description:
              "Сейчас, чтобы создался аккаунт внтури скиллз, пользователю обязательно надо войти внутрь вкладки траектории и еще раз залогиниться...",
            priority: 3,
          },
          { id: 2, title: "создать дизайн макеты" },
        ],
      },
      {
        id: 1,
        locked: false,
        order: 1,
        name: "в работе",
        tasks: [
          { id: 3, title: "настроить API" },
          { id: 4, title: "подключить WebSocket" },
        ],
      },
      {
        id: 2,
        locked: false,
        order: 2,
        name: "Готово",
        tasks: [
          { id: 5, title: "верстка страницы входа" },
          { id: 6, title: "настроить Dockerfile" },
        ],
      },
    ];

    this.boardColumns.set(mockColumns);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  toggleDropDown(columnId: number): void {
    if (this.selectedColumnId === columnId) {
      this.isColumnInfoOpen = !this.isColumnInfoOpen;
    } else {
      this.selectedColumnId = columnId;
      this.isColumnInfoOpen = true;
    }
  }

  onTypeSelect(option: any, state: boolean, columnId?: number): void {
    if (!option) {
      this.isColumnInfoOpen = state;
      return;
    }

    switch (option) {
      case 1:
        console.log("EDIT in column:", columnId);
        break;

      case 2:
        console.log("DELETE in column:", columnId);
        break;
    }

    this.isColumnInfoOpen = state;
  }

  openDetailTask(taskId: number): void {
    this.router.navigate([], {
      queryParams: {
        taskId,
      },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
    this.isTaskDetailOpen.set(true);
  }

  closeDetailTask(): void {
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
    this.isTaskDetailOpen.set(false);
  }
}
