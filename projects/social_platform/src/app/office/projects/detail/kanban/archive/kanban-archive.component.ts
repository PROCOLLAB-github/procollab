/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { Subscription } from "rxjs";
import { KanbanBoardDetailInfoService } from "../services/kanban-board-detail-info.service";
import { TaskPreview } from "../models/task.model";
import { ActivatedRoute } from "@angular/router";
import { KanbanTaskComponent } from "../shared/task/kanban-task.component";

@Component({
  selector: "app-kanban-archive",
  templateUrl: "./kanban-archive.component.html",
  styleUrl: "./kanban-archive.component.scss",
  imports: [CommonModule, SearchComponent, ReactiveFormsModule, KanbanTaskComponent],
  standalone: true,
})
export class KanbanArhiveComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly kanbanBoardDetailInfoService = inject(KanbanBoardDetailInfoService);

  completedTasks = signal<any[]>([]);
  isTaskDetailOpen = signal<boolean>(false);

  constructor() {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  searchForm: FormGroup;

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const detailInfoUrl$ = this.kanbanBoardDetailInfoService.route.queryParams.subscribe(params => {
      this.isTaskDetailOpen.set(!!params["taskId"]);
    });

    this.subscriptions.push(detailInfoUrl$);

    const completedTasks$ = this.route.data.subscribe({
      next: tasks => {
        this.completedTasks.set(tasks as TaskPreview[]);
      },
    });

    this.subscriptions.push(completedTasks$);

    const mockCompleteTasks = [
      {
        id: 11,
        title: "123",
        description:
          "Сейчас, чтобы создался аккаунт внтури скиллз, пользователю обязательно надо войти внутрь вкладки траектории и еще раз залогиниться...",
        priority: 5,
        type: 2,
        responsible: {
          id: 12,
          avatar: "",
        },
        performers: [
          {
            id: 12,
            avatar: "",
          },
          {
            id: 25,
            avatar: "",
          },
          {
            id: 26,
            avatar: "",
          },
        ],
        tags: [
          {
            id: 2,
            name: "123",
            color: "accent",
          },
        ],
        score: 10,
        filtes: [],
      },
    ];

    this.completedTasks.set(mockCompleteTasks);
  }

  openDetailTask(taskId: number): void {
    this.kanbanBoardDetailInfoService.openDetailTask(taskId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }
}
