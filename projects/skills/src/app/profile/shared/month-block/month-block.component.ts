/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { Profile } from "../../../../models/profile.model";

@Component({
  selector: "app-month-block",
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: "./month-block.component.html",
  styleUrl: "./month-block.component.scss",
})
export class MonthBlockComponent implements OnInit {
  @Input({ required: true }) months!: Profile["months"];

  ngOnInit(): void {
    console.log(this.months[0].successfullyDone);
  }
}
