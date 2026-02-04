/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, signal } from "@angular/core";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { KanbanBoardActionsComponent } from "../actions/kanban-board-actions.component";
import { DropdownComponent } from "@ui/components/dropdown/dropdown.component";
import { ClickOutsideModule } from "ng-click-outside";
import { Router } from "@angular/router";
import { KanbanBoardInfoService } from "../../../../../../../api/kanban/kanban-board-info.service";
import { CreateBoardFormComponent } from "../create-board-form/create-board-form.component";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";

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
    CreateBoardFormComponent,
  ],
  standalone: true,
})
export class KanbanBoardSidebarComponent {
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly kanbanBoardInfoService = inject(KanbanBoardInfoService);
  private readonly router = inject(Router);

  readonly boardInfo = this.kanbanBoardInfoService.boardInfo;
  readonly isFirstBoard = this.kanbanBoardInfoService.isFirstBoard;
  readonly projectBoardInfo = this.projectsDetailUIInfoService.project;

  isContextMenuOpen = signal<boolean>(false);
  isBoardInfoOpen = signal<boolean>(false);
  isCreateBoardForm = signal<boolean>(false);

  get contextMenuOptions() {
    return [
      {
        id: 1,
        label: "выгрузка доски",
        value: "",
      },
      {
        id: 2,
        label: "архив выполнено",
        value: "",
      },
      {
        id: 3,
        label: "выгрузка архива выполнено",
        value: "",
      },
      {
        id: 4,
        label: "информация о доске",
        value: "",
      },
      {
        id: 5,
        label: "редактировать",
        value: "",
      },
    ];
  }

  onContextSelect(option: any, state: boolean) {
    switch (option) {
      case 1: {
        console.log(option);
        break;
      }

      case 2: {
        this.navigateTo("archive", this.projectBoardInfo()!);
        break;
      }

      case 4: {
        this.isBoardInfoOpen.set(true);
        break;
      }

      case 5: {
        if (!this.isFirstBoard()) {
          console.log("edited");
        }
        break;
      }
    }

    this.isContextMenuOpen.set(state);
  }

  onMouseDown(event: MouseEvent, board: any): void {
    event.stopPropagation();

    if (event.button === 2 || event.ctrlKey) {
      event.preventDefault();
      this.isContextMenuOpen.set(true);
      return;
    }

    if (event.button === 0) {
      this.navigateTo("project", this.projectBoardInfo()!);

      this.kanbanBoardInfoService.setSelectedBoard(board.id);
    }
  }

  onBoardCreate(openCreation: boolean): void {
    this.isCreateBoardForm.set(openCreation);
  }

  private navigateTo(type: "project" | "archive", projectBoardInfo: Project): void {
    switch (type) {
      case "project": {
        this.router.navigate(["office/projects/" + projectBoardInfo.id + "/kanban/board/"]);
        console.log(projectBoardInfo.id);
        break;
      }

      case "archive": {
        this.router.navigate(["office/projects/" + projectBoardInfo.id + "/kanban/archive"]);
        break;
      }
    }
  }
}
