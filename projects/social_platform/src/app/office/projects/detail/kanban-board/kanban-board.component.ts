/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Subscription } from "rxjs";
import { ProjectDataService } from "../services/project-data.service";
import { Project } from "@office/models/project.model";
import { KanbanBoardSidebarComponent } from "./shared/sidebar/kanban-board-sidebar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { IconComponent, InputComponent } from "@ui/components";
import { KanbanTaskComponent } from "./shared/task/kanban-task.component";
import { ClickOutsideModule } from "ng-click-outside";
import { TaskDetailComponent } from "./shared/task/detail/task-detail.component";
import { DropdownComponent } from "@ui/components/dropdown/dropdown.component";
import { kanbanColumnInfo } from "projects/core/src/consts/other/kanban-column-info.const";
import { Column } from "./models/column.model";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";

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
    ReactiveFormsModule,
    TaskDetailComponent,
    DropdownComponent,
    InputComponent,
    ControlErrorPipe,
  ],
  standalone: true,
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  private readonly projectDataService = inject(ProjectDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private subscriptions: Subscription[] = [];

  constructor() {
    this.taskForm = this.fb.group({
      columnTitle: ["", Validators.required],
    });
  }

  projectBoardInfo = signal<Project | null>(null);
  boardColumns = signal<any[]>([]);
  isTaskDetailOpen = signal<boolean>(false);

  isColumnInfoOpen = false;
  selectedColumnId: number | null = null;

  editColumn = false;

  addingTaskColumnId: number | null = null;

  taskForm: FormGroup;

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

    const boardInfo$ = this.route.data.subscribe({
      next: columns => {
        this.boardColumns.set(columns as Column[]);
      },
    });

    this.subscriptions.push(boardInfo$);

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
        this.selectedColumnId = columnId!;
        this.editColumn = true;
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

  confirmRenameColumn(id: number) {
    const title = this.taskForm.get("columnTitle")?.value;

    if (!title) return;

    this.boardColumns.update(columns =>
      columns.map(column => (column.id === id ? { ...column, name: title } : column))
    );

    this.selectedColumnId = null;
    this.editColumn = false;

    this.taskForm.reset();
  }
}
