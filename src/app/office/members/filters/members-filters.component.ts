/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@ui/components";
import { RangeInputComponent } from "@ui/components/range-input/range-input.component";
import { MembersComponent } from "@office/members/members.component";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-members-filters",
  standalone: true,
  imports: [CommonModule, RangeInputComponent, IconComponent, ReactiveFormsModule],
  templateUrl: "./members-filters.component.html",
  styleUrl: "./members-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersFiltersComponent {
  @Output() filtersChanged = new EventEmitter();
  filtersOpen = false;

  @Input({ required: true }) filterForm!: MembersComponent["filterForm"];
}
