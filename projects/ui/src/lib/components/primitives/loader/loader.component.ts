/** @format */

import { ChangeDetectionStrategy, Component, input, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-loader",
  templateUrl: "./loader.component.html",
  styleUrl: "./loader.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent implements OnInit {
  readonly speed = input<string>("1s");
  readonly size = input<string>("15px");
  readonly color = input<string>("white");
  readonly type = input<"wave" | "circle">("circle");

  ngOnInit(): void {}
}
