/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { Specialization } from "@domain/specializations/specialization.model";

/** Компонент группы специализаций с возможностью сворачивания и выбора. */
@Component({
  selector: "app-specializations-group",
  imports: [CommonModule, IconComponent],
  templateUrl: "./specializations-group.component.html",
  styleUrl: "./specializations-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecializationsGroupComponent {
  readonly title = input.required<string>();
  readonly options = input.required<Specialization[]>();
  readonly hasOpenGroups = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly selectOption = output<Specialization>();
  readonly groupToggled = output<boolean>();

  contentVisible = signal(false);

  toggleContentVisible() {
    if (this.disabled()) {
      return;
    }

    this.contentVisible.update(val => !val);
    this.groupToggled.emit(this.contentVisible());
  }

  onSelectOption(opt: Specialization) {
    if (this.disabled()) {
      return;
    }

    this.selectOption.emit(opt);
  }
}
