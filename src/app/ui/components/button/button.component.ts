/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
})
export class ButtonComponent implements OnInit {
  constructor() {}

  @Input() color: "primary" | "red" = "primary";

  ngOnInit(): void {}
}
