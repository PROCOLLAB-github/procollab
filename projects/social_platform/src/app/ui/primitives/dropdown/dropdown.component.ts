/** @format */

import { ConnectedPosition, OverlayModule } from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  input,
  model,
  output,
  viewChild,
} from "@angular/core";
import { getPriorityType } from "@utils/getPriorityType";
import { ClickOutsideModule } from "ng-click-outside";
import { TagDto } from "@domain/kanban/dto/tag.model.dto";
import { CreateTagFormComponent } from "@ui/pages/projects/detail/kanban/components/create-tag-form/create-tag-form.component";
import { TagComponent } from "../tag/tag.component";
import { AvatarComponent } from "../avatar/avatar.component";
import { IconComponent } from "../icon/icon.component";

/** Примитив: выпадающий список. */
@Component({
  selector: "app-dropdown",
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  /** Состояние для определения списка элементов */
  options = input<
    {
      id: number;
      label: string;
      value: string | number | boolean | null;
      additionalInfo?: any;
    }[]
  >([]);

  type = input<"icons" | "avatars" | "shapes" | "tags" | "goals" | "text">("text");

  /** Состояние для открытия списка выпадающего */
  @Input() isOpen = false;

  /** режим создания тега */
  creatingTag = model(false);

  /** Состояние для выделения элемента списка выпадающего */
  highlightedIndex = input(-1);

  colorText = input<"grey" | "red">("grey");

  editingTag = input<TagDto | null>(null);

  updateTag = output<TagDto>();

  /** Событие для выбора элемента */
  select = output<number>();

  /** Событие для логики при клике вне списка выпадающего */
  outside = output<void>();

  tagInfo = output<{ name: string; color: string }>();

  dropdown = viewChild<ElementRef>("dropdown");

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
    this.creatingTag.set(true);
  }

  onConfirmUpdateTag(tagData: TagDto): void {
    this.updateTag.emit(tagData);
    this.creatingTag.set(false);
  }

  onConfirmCreateTag(tagInfo: { name: string; color: string }): void {
    this.tagInfo.emit(tagInfo);
    this.creatingTag.set(false);
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
