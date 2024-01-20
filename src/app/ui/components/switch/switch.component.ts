/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-switch",
  templateUrl: "./switch.component.html",
  styleUrl: "./switch.component.scss",
  standalone: true,
})
export class SwitchComponent implements OnInit {
  @Input({ required: true }) checked!: boolean;
  @Output() checkedChange = new EventEmitter<boolean>();

  ngOnInit(): void {}
}
