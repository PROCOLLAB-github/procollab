/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Output, EventEmitter } from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { RangeInputComponent } from "@ui/components/range-input/range-input.component";

@Component({
  selector: "app-members-filters",
  standalone: true,
  imports: [CommonModule, RangeInputComponent, ButtonComponent, IconComponent],
  templateUrl: "./members-filters.component.html",
  styleUrl: "./members-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersFiltersComponent {
  @Output() filtersChanged = new EventEmitter();

  filtersOpen = false;
}
