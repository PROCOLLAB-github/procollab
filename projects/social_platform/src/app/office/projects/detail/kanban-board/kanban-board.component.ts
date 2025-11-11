/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Subscription } from "rxjs";
import { ProjectDataService } from "../services/project-data.service";
import { Project } from "@office/models/project.model";
import { KanbanBoardSidebarComponent } from "./shared/sidebar/kanban-board-sidebar.component";
import { ActivatedRoute } from "@angular/router";
import { IconComponent, ButtonComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { EditorSubmitButtonDirective } from "@ui/directives/editor-submit-button.directive";

@Component({
  selector: "app-kanban-board",
  templateUrl: "./kanban-board.component.html",
  styleUrl: "./kanban-board.component.scss",
  imports: [
    CommonModule,
    KanbanBoardSidebarComponent,
    IconComponent,
    ButtonComponent,
    AvatarComponent,
    TagComponent,
    EditorSubmitButtonDirective,
  ],
  standalone: true,
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  private readonly projectDataService = inject(ProjectDataService);
  private readonly route = inject(ActivatedRoute);
  private subscriptions: Subscription[] = [];

  projectBoardInfo = signal<Project | null>(null);
  boardColumns = signal<any[]>([]);

  ngOnInit(): void {
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
        locked: true,
        tasks: [
          {
            id: 1,
            title: "собрать требования",
            description:
              "Сейчас, чтобы создался аккаунт внтури скиллз, пользователю обязательно надо войти внутрь вкладки траектории и еще раз залогиниться...",
          },
          { id: 2, title: "создать дизайн макеты" },
        ],
      },
      {
        id: 1,
        locked: false,
        name: "в работе",
        tasks: [
          { id: 3, title: "настроить API" },
          { id: 4, title: "подключить WebSocket" },
        ],
      },
      {
        id: 2,
        locked: false,
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

  private buildColumns(): void {}
}
