/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
    selector: "app-loader",
    templateUrl: "./loader.component.html",
    styleUrl: "./loader.component.scss",
    standalone: true,
    imports: [NgIf],
})
export class LoaderComponent implements OnInit {
  constructor() {}

  @Input() speed = "1s";
  @Input() size = "47px";
  @Input() color = "white";
  @Input() type: "wave" | "circle" = "wave";

  ngOnInit(): void {}
}
