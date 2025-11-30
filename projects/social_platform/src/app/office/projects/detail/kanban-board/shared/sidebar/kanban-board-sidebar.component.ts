/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, signal } from "@angular/core";
import { Project } from "@office/models/project.model";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { KanbanBoardActionsComponent } from "../actions/kanban-board-actions.component";
import { DropdownComponent } from "@ui/components/dropdown/dropdown.component";
import { ClickOutsideModule } from "ng-click-outside";
import { ProjectDataService } from "@office/projects/detail/services/project-data.service";

@Component({
  selector: "app-kanban-board-sidebar",
  templateUrl: "./kanban-board-sidebar.component.html",
  styleUrl: "./kanban-board-sidebar.component.scss",
  imports: [
    CommonModule,
    AvatarComponent,
    KanbanBoardActionsComponent,
    DropdownComponent,
    ClickOutsideModule,
  ],
  standalone: true,
})
export class KanbanBoardSidebarComponent {
  private readonly projectDataService = inject(ProjectDataService);

  isContextMenuOpen = signal<boolean>(false);

  projectBoardInfo = this.projectDataService.project();

  onMouseDown(event: MouseEvent, projectBoardInfo: Project): void {
    event.stopPropagation();

    if (event.button === 2 || event.ctrlKey) {
      event.preventDefault();
      this.isContextMenuOpen.set(true);
      return;
    }

    if (event.button === 0) {
      this.navigateToDifferentBoard(projectBoardInfo);
    }
  }

  private navigateToDifferentBoard(projectBoardInfo: Project): void {
    console.log(projectBoardInfo.id);
  }

  get contextMenuOptions() {
    return [
      {
        id: 1,
        label: "выгрузить",
        value: "",
      },
      {
        id: 2,
        label: "архив выполнено",
        value: "",
      },
    ];
  }
}
