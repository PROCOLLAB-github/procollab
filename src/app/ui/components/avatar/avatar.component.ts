/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"],
})
export class AvatarComponent implements OnInit {
  @Input() url?: string;
  placeholderUrl = "https://joeschmoe.io/api/v1/random";

  constructor() {}

  ngOnInit(): void {}
}
