/** @format */

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-kanban-board-actions",
  templateUrl: "./kanban-board-actions.component.html",
  styleUrl: "./kanban-board-actions.component.scss",
  imports: [CommonModule, IconComponent],
  standalone: true,
})
export class KanbanBoardActionsComponent {}
