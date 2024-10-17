/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-tag",
  templateUrl: "./tag.component.html",
  styleUrl: "./tag.component.scss",
  standalone: true,
})
export class TagComponent implements OnInit {
  constructor() {}

  @Input() color: "primary" | "accent" | "complete" = "primary";

  ngOnInit(): void {}
}
