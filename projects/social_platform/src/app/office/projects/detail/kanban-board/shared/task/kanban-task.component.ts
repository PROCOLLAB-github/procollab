/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IconComponent } from "@uilib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { hexToRgba } from "@utils/helpers/hexToRgba";
import { priorityInfoList } from "projects/core/src/consts/lists/priority-info-list.const";

@Component({
  selector: "app-kanban-task",
  templateUrl: "./kanban-task.component.html",
  styleUrl: "./kanban-task.component.scss",
  imports: [CommonModule, IconComponent, AvatarComponent, TagComponent],
  standalone: true,
})
export class KanbanTaskComponent {
  @Input({ required: true }) task: any;

  private readonly priorityInfoList = priorityInfoList;
  private readonly hexToRgba = hexToRgba;

  getPriorityType(priorityId: number, type: "background" | "color", opacity = 0.25) {
    const findedPriority = this.priorityInfoList.find(
      priority => priority.priorityType === priorityId
    );
    const baseColor = findedPriority?.color ?? "var(--light-white)";

    if (!findedPriority) return;

    if (type === "color") {
      return { "background-color": baseColor };
    }

    const rgbaColor = this.hexToRgba(baseColor, opacity);
    return { "background-color": rgbaColor };
  }
}
