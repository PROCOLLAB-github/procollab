/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-tag",
  templateUrl: "./tag.component.html",
  styleUrls: ["./tag.component.scss"],
})
export class TagComponent implements OnInit {
  constructor() {}

  @Input() color: "primary" | "accent" = "primary";

  ngOnInit(): void {}
}
