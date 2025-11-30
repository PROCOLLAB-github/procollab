/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { IconComponent } from "@uilib";
import { KanbanBoardInfoService } from "../../services/kanban-board-info.service";

@Component({
  selector: "app-kanban-board-actions",
  templateUrl: "./kanban-board-actions.component.html",
  styleUrl: "./kanban-board-actions.component.scss",
  imports: [CommonModule, IconComponent],
  standalone: true,
})
export class KanbanBoardActionsComponent {
  private readonly kanbanBoardInfoService = inject(KanbanBoardInfoService);
  readonly isLeader = this.kanbanBoardInfoService.isLeader;
}
