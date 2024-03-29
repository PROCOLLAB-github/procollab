/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@ui/components";
import { Specialization } from "@office/models/specialization";

@Component({
  selector: "app-specializations-group",
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: "./specializations-group.component.html",
  styleUrl: "./specializations-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecializationsGroupComponent {
  @Input({ required: true }) title!: string;

  @Input({ required: true }) options!: Specialization[];

  @Output() selectOption = new EventEmitter<Specialization>();

  contentVisible = false;

  onSelectOption(opt: Specialization) {
    this.selectOption.emit(opt);
  }
}
