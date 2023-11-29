/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IconComponent } from "@ui/components";

@Component({
  selector: "app-checkbox",
  templateUrl: "./checkbox.component.html",
  styleUrl: "./checkbox.component.scss",
  standalone: true,
  imports: [IconComponent],
})
export class CheckboxComponent implements OnInit {
  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  ngOnInit(): void {}
}
