/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Project } from "@office/models/project.model";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { KanbanBoardActionsComponent } from "../actions/kanban-board-actions.component";

@Component({
  selector: "app-kanban-board-sidebar",
  templateUrl: "./kanban-board-sidebar.component.html",
  styleUrl: "./kanban-board-sidebar.component.scss",
  imports: [CommonModule, AvatarComponent, KanbanBoardActionsComponent],
  standalone: true,
})
export class KanbanBoardSidebarComponent {
  @Input({ required: true }) projectBoardInfo!: Project;
}
