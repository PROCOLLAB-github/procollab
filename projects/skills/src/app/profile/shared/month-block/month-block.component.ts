/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Profile } from "../../../../models/profile.model";

@Component({
  selector: "app-month-block",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./month-block.component.html",
  styleUrl: "./month-block.component.scss",
})
export class MonthBlockComponent {
  @Input({ required: true }) months!: Profile["months"];
  @Input() hasNext = true;
}
