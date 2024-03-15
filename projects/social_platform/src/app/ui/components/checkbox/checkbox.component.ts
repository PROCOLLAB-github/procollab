/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IconComponent } from "@ui/components/icon/icon.component";

@Component({
  selector: "app-checkbox",
  templateUrl: "./checkbox.component.html",
  styleUrl: "./checkbox.component.scss",
  standalone: true,
  imports: [IconComponent],
})
export class CheckboxComponent implements OnInit {
  @Input({ required: true }) checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  ngOnInit(): void {}
}
