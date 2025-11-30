/** @format */

import { ConnectedPosition, OverlayModule } from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { IconComponent } from "@uilib";
import { getPriorityType } from "@utils/helpers/getPriorityType";
import { TagComponent } from "../tag/tag.component";
import { ClickOutsideModule } from "ng-click-outside";
import { CreateTagFormComponent } from "@office/projects/detail/kanban-board/shared/create-tag-form/create-tag-form.component";
import { TagDto } from "@office/projects/detail/kanban-board/models/dto/tag.model.dto";

@Component({
  selector: "app-dropdown",
  standalone: true,
  imports: [
    CommonModule,
    OverlayModule,
    AvatarComponent,
    IconComponent,
    TagComponent,
    ClickOutsideModule,
    CreateTagFormComponent,
  ],
  templateUrl: "./dropdown.component.html",
  styleUrl: "./dropdown.component.scss",
})
export class DropdownComponent {
  /** Состояние для определения списка элементов */
  @Input() options: { id: number; label: string; value: any; additionalInfo?: any }[] = [];

  @Input() type: "icons" | "avatars" | "shapes" | "tags" | "goals" | "text" = "text";

  /** Состояние для открытия списка выпадающего */
  @Input() isOpen = false;

  /** режим создания тега */
  @Input() creatingTag = false;

  /** Состояние для выделения элемента списка выпадающего */
  @Input() highlightedIndex = -1;

  @Input() colorText: "grey" | "red" = "grey";

  @Input() editingTag: TagDto | null = null;

  @Output() updateTag = new EventEmitter<TagDto>();

  /** Событие для выбора элемента */
  @Output() select = new EventEmitter<number>();

  /** Событие для логики при клике вне списка выпадающего */
  @Output() outside = new EventEmitter<void>();

  @Output() tagInfo = new EventEmitter<{ name: string; color: string }>();

  @ViewChild("dropdown", { static: true }) dropdown!: ElementRef;

  getPriorityType = getPriorityType;

  positions: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
      offsetY: 4,
    },
    {
      originX: "start",
      originY: "top",
      overlayX: "start",
      overlayY: "bottom",
      offsetY: -4,
    },
  ];

  /** Метод для выбора элемента и emit для родительского компонента */
  onSelect(event: Event, id: number) {
    event.stopPropagation();
    this.select.emit(id);
  }

  /** Метод для клика вне списка выпадающего */
  onClickOutside() {
    this.outside.emit();
  }

  startCreatingTag(event: Event) {
    event.stopPropagation();
    this.creatingTag = true;
  }

  onConfirmUpdateTag(tagData: TagDto): void {
    this.updateTag.emit(tagData);
    this.creatingTag = false;
  }

  onConfirmCreateTag(tagInfo: { name: string; color: string }): void {
    this.tagInfo.emit(tagInfo);
    this.creatingTag = false;
  }

  getTextColor(colorText: "grey" | "red") {
    switch (colorText) {
      case "red":
        return "color: var(--red)";

      case "grey":
        return "color: var(--grey-for-text)";
    }
  }
}
