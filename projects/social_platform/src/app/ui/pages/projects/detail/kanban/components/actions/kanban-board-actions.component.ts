/** @format */

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Output } from "@angular/core";
import { IconComponent } from "@uilib";
import { KanbanBoardDetailInfoService } from "../../../../../../../api/kanban/kanban-board-detail-info.service";

@Component({
  selector: "app-kanban-board-actions",
  templateUrl: "./kanban-board-actions.component.html",
  styleUrl: "./kanban-board-actions.component.scss",
  imports: [CommonModule, IconComponent],
  standalone: true,
})
export class KanbanBoardActionsComponent {
  @Output() openCreation = new EventEmitter<boolean>();

  private readonly kanbanBoardDetailInfoService = inject(KanbanBoardDetailInfoService);
  readonly isLeader = this.kanbanBoardDetailInfoService.isLeader;

  addBoard(event: MouseEvent): void {
    event.stopPropagation();
    this.openCreation.emit(true);
  }
}
