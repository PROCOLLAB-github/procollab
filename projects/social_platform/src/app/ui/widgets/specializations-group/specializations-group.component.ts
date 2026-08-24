/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
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
  readonly isOpen = input<boolean | null>(null);
  readonly disabled = input<boolean>(false);
  readonly selectedName = input<string | null>(null);

  readonly selectOption = output<Specialization>();
  readonly groupToggled = output<boolean>();

  private readonly internalContentVisible = signal(false);
  readonly contentVisible = computed(() => this.isOpen() ?? this.internalContentVisible());

  toggleContentVisible() {
    if (this.disabled()) {
      return;
    }

    const nextValue = !this.contentVisible();
    this.internalContentVisible.set(nextValue);
    this.groupToggled.emit(nextValue);
  }

  onSelectOption(opt: Specialization) {
    if (this.disabled()) {
      return;
    }

    this.selectOption.emit(opt);
  }
}
