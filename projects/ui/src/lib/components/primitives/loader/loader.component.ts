/** @format */

import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-loader",
  templateUrl: "./loader.component.html",
  styleUrl: "./loader.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent implements OnInit {
  constructor() {}

  @Input() speed = "1s";
  @Input() size = "15px";
  @Input() color = "white";
  @Input() type: "wave" | "circle" = "circle";

  ngOnInit(): void {}
}
