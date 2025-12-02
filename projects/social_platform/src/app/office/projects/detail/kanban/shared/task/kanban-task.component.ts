/** @format */

import { CommonModule } from "@angular/common";
import { Component, computed, inject, Input } from "@angular/core";
import { IconComponent } from "@uilib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { RouterModule } from "@angular/router";
import { getPriorityType } from "@utils/helpers/getPriorityType";
import { TaskPreview } from "../../models/task.model";
import { KanbanBoardDetailInfoService } from "../../services/kanban-board-detail-info.service";
import { PluralizePipe } from "@corelib";
import { CancelTaskFormComponent } from "../cancel-task-form/cancel-task-form.component";
import { ModalComponent } from "@ui/components/modal/modal.component";

@Component({
  selector: "app-kanban-task",
  templateUrl: "./kanban-task.component.html",
  styleUrl: "./kanban-task.component.scss",
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    AvatarComponent,
    TagComponent,
    PluralizePipe,
    CancelTaskFormComponent,
    ModalComponent,
  ],
  standalone: true,
})
export class KanbanTaskComponent {
  @Input({ required: true }) task!: TaskPreview;

  private readonly kanbanBoardDetailInfoService = inject(KanbanBoardDetailInfoService);

  readonly isArchivePage = this.kanbanBoardDetailInfoService.isArchivePage;
  readonly isOverdue = this.kanbanBoardDetailInfoService.isOverdue;
  readonly isLeader = this.kanbanBoardDetailInfoService.isLeader;
  readonly diffDays = this.kanbanBoardDetailInfoService.diffDaysOfCompletedTask;

  isCancelFormOpen = false;

  getPriorityType = getPriorityType;

  onToggleCancelTaskForm(): void {
    this.isCancelFormOpen = !this.isCancelFormOpen;
  }
}
