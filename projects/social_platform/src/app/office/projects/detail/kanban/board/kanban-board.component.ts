/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { InputComponent } from "@ui/components";
import { DropdownComponent } from "@ui/components/dropdown/dropdown.component";
import { KanbanTaskComponent } from "../shared/task/kanban-task.component";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { TaskPreview } from "../models/task.model";
import { kanbanColumnInfo } from "projects/core/src/consts/other/kanban-column-info.const";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { KanbanBoardDetailInfoService } from "../services/kanban-board-detail-info.service";
import { Subscription } from "rxjs";
import { Column } from "../models/column.model";
import { IconComponent } from "@uilib";
import { ControlErrorPipe } from "@corelib";

@Component({
  selector: "app-kanban-board",
  templateUrl: "./kanban-board.component.html",
  styleUrl: "./kanban-board.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    KanbanTaskComponent,
    ReactiveFormsModule,
    DropdownComponent,
    InputComponent,
    ControlErrorPipe,
    CdkDropList,
    CdkDrag,
  ],
  standalone: true,
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  private readonly kanbanBoardDetailInfoService = inject(KanbanBoardDetailInfoService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly subscriptions: Subscription[] = [];

  constructor() {
    this.taskForm = this.fb.group({
      columnTitle: ["", Validators.required],
      taskTitle: ["", Validators.required],
    });
  }

  boardColumns = signal<any[]>([]);

  connectedLists = computed(() => this.boardColumns().map(c => "tasks-column-" + c.id));

  isTaskDetailOpen = signal<boolean>(false);

  isColumnInfoOpen = false;
  selectedColumnId: number | null = null;

  editColumn = false;
  addTaskClick = false;

  addingTaskColumnId: number | null = null;

  taskForm: FormGroup;

  get columnInfoOptions() {
    return kanbanColumnInfo;
  }

  readonly isLeader = this.kanbanBoardDetailInfoService.isLeader();
  readonly isExternal = this.kanbanBoardDetailInfoService.isExternal();

  ngOnInit(): void {
    const detailInfoUrl$ = this.kanbanBoardDetailInfoService.route.queryParams.subscribe(params => {
      this.isTaskDetailOpen.set(!!params["taskId"]);
    });

    this.subscriptions.push(detailInfoUrl$);

    this.kanbanBoardDetailInfoService.onTaskDelete().subscribe(taskId => {
      this.onDeleteTask(taskId);
    });

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
            columnId: 0,
          },
          { id: 2, title: "создать дизайн макеты", columnId: 0 },
        ],
      },
      {
        id: 1,
        locked: false,
        order: 1,
        name: "в работе",
        tasks: [
          { id: 3, title: "настроить API", columnId: 1 },
          { id: 4, title: "подключить WebSocket", columnId: 1 },
        ],
      },
      {
        id: 2,
        locked: false,
        order: 2,
        name: "Готово",
        tasks: [
          { id: 5, title: "верстка страницы входа", columnId: 2 },
          { id: 6, title: "настроить Dockerfile", columnId: 2 },
        ],
      },
    ];
    this.boardColumns.set(mockColumns);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  toggleDropDown(columnId: number): void {
    const sameColumn = this.selectedColumnId === columnId;

    if (sameColumn) {
      this.isColumnInfoOpen = !this.isColumnInfoOpen;
      return;
    }

    this.selectedColumnId = columnId;
    this.isColumnInfoOpen = true;

    if (this.editColumn) {
      this.editColumn = false;
    }
  }

  onTypeSelect(option: any, state: boolean, columnId?: number): void {
    if (!option) {
      this.isColumnInfoOpen = state;
      return;
    }
    this.selectedColumnId = columnId!;

    switch (option) {
      case 1:
        this.editColumn = true;
        break;

      case 2:
        this.deleteColumn();
        break;
    }

    this.isColumnInfoOpen = state;
  }

  startAddingTask(columnId: number): void {
    if (this.isTaskDetailOpen()) return;

    this.addTaskClick = true;
    this.selectedColumnId = columnId;
  }

  confirmAddTask(): void {
    const title = this.taskForm.get("taskTitle")?.value;

    if (!title) return;

    const newTask = {
      id: Date.now(),
      title,
    };

    this.boardColumns.update(columns =>
      columns.map(column =>
        column.id === this.selectedColumnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    );

    this.cancelAddingTask();
  }

  cancelAddingTask(): void {
    this.selectedColumnId = null;
    this.addTaskClick = false;
    this.taskForm.patchValue({ taskTitle: "" });
  }

  openDetailTask(taskId: number): void {
    this.kanbanBoardDetailInfoService.openDetailTask(taskId);
  }

  onDeleteTask(taskId: number): void {
    this.boardColumns.update(columns =>
      columns.map(col => ({
        ...col,
        tasks: col.tasks.filter((task: TaskPreview) => task.id !== taskId),
      }))
    );

    this.kanbanBoardDetailInfoService.closeDetailTask();
    this.cdRef.detectChanges();
  }

  addColumn(): void {
    const columnTitle = this.taskForm.get("columnTitle")?.value;

    const newColumn = {
      id: Date.now(),
      name: columnTitle,
      locked: false,
      order: this.boardColumns().length,
      tasks: [],
    };

    this.boardColumns.update(columns => [...columns, newColumn]);

    this.editColumn = true;
    this.selectedColumnId = this.boardColumns()[this.boardColumns().length - 1].id;
  }

  deleteColumn(): void {
    if (this.selectedColumnId === 0) return;

    this.boardColumns.update(columns =>
      columns.filter(column => column.id !== this.selectedColumnId)
    );
  }

  confirmRenameColumn() {
    const title = this.taskForm.get("columnTitle")?.value;

    if (!title) return;

    this.boardColumns.update(columns =>
      columns.map(column =>
        column.id === this.selectedColumnId ? { ...column, name: title } : column
      )
    );

    this.selectedColumnId = null;
    this.editColumn = false;

    this.taskForm.reset();
  }

  cancelRenamColumn(): void {
    this.selectedColumnId = null;
    this.editColumn = false;
    this.taskForm.patchValue({ columnTitle: "" });
  }

  onDropTask(event: CdkDragDrop<any[]>): void {
    const columns = this.boardColumns();

    const prevColumn = columns.find(col => col.tasks === event.previousContainer.data);
    const currColumn = columns.find(col => col.tasks === event.container.data);

    if (!prevColumn || !currColumn) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(currColumn.tasks, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        prevColumn.tasks,
        currColumn.tasks,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.boardColumns.set([...columns]);
  }

  onDropColumn(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const columns = [...this.boardColumns()];

    if (columns[event.previousIndex].id === 0) {
      return;
    }

    if (event.currentIndex === 0) {
      return;
    }

    if (columns[event.previousIndex].locked || columns[event.previousIndex].id === 0) {
      return;
    }

    moveItemInArray(columns, event.previousIndex, event.currentIndex);

    const updatedColumns = columns.map((col, index) => ({
      ...col,
      order: index,
    }));

    this.boardColumns.set(updatedColumns);
  }

  columnDropPredicate = (index: number): boolean => {
    return index !== 0;
  };
}
