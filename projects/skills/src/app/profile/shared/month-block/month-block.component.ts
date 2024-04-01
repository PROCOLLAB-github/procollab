/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-month-block",
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: "./month-block.component.html",
  styleUrl: "./month-block.component.scss",
})
export class MonthBlockComponent {
  months = [
    { name: "Январь", status: "passed" },
    { name: "Февраль", status: "failed" },
    { name: "Март", status: "not-started" },
  ];
}
