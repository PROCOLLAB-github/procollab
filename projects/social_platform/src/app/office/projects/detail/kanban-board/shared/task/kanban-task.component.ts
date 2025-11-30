/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IconComponent } from "@uilib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { RouterModule } from "@angular/router";
import { getPriorityType } from "@utils/helpers/getPriorityType";
import { TaskPreview } from "../../models/task.model";

@Component({
  selector: "app-kanban-task",
  templateUrl: "./kanban-task.component.html",
  styleUrl: "./kanban-task.component.scss",
  imports: [CommonModule, RouterModule, IconComponent, AvatarComponent, TagComponent],
  standalone: true,
})
export class KanbanTaskComponent {
  @Input({ required: true }) task!: TaskPreview;

  getPriorityType = getPriorityType;
}
