/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.scss"],
})
export class LoaderComponent implements OnInit {
  constructor() {}

  @Input() speed = "1s";
  @Input() size = "47px";
  @Input() color = "white";
  ngOnInit(): void {}
}
