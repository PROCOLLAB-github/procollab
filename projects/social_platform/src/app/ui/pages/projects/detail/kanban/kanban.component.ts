/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { RouterOutlet, ActivatedRoute } from "@angular/router";
import { KanbanBoardSidebarComponent } from "./components/sidebar/kanban-board-sidebar.component";
import { TaskDetailComponent } from "./components/task/detail/task-detail.component";
import { KanbanBoardDetailInfoService } from "../../../../../api/kanban/kanban-board-detail-info.service";
import { Subscription } from "rxjs";
import { ClickOutsideModule } from "ng-click-outside";

@Component({
  selector: "app-kanban",
  templateUrl: "./kanban.component.html",
  styleUrl: "./kanban.component.scss",
  imports: [
    CommonModule,
    RouterOutlet,
    KanbanBoardSidebarComponent,
    TaskDetailComponent,
    ClickOutsideModule,
  ],
  standalone: true,
})
export class KanbanComponent implements OnInit {
  private readonly kanbanBoardDetailInfoService = inject(KanbanBoardDetailInfoService);

  readonly isTaskDetailOpen = signal<boolean>(false);
  private readonly subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const detailInfoUrl$ = this.kanbanBoardDetailInfoService.route.queryParams.subscribe(params => {
      this.isTaskDetailOpen.set(!!params["taskId"]);
    });

    this.subscriptions.push(detailInfoUrl$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  closeDetailTask(): void {
    this.kanbanBoardDetailInfoService.closeDetailTask();
  }
}
