/** @format */

import { ChangeDetectionStrategy, Component, Input, type OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "../loader/loader.component";

@Component({
    selector: "app-button",
    templateUrl: "./button.component.html",
    styleUrl: "./button.component.scss",
    imports: [CommonModule, LoaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent implements OnInit {
  constructor() {}

  @Input() color: "primary" | "red" | "grey" | "green" | "gold" | "gradient" | "white" = "primary";
  @Input() loader = false;
  @Input() size: "extra-small" | "small" | "medium" | "big" = "small";
  @Input() hasBorder = true;
  @Input() type: "submit" | "reset" | "button" | "icon" = "button";
  @Input() appearance: "inline" | "outline" = "inline";
  @Input() backgroundColor?: string;
  @Input() disabled = false;
  @Input() customTypographyClass?: string;

  ngOnInit(): void {}
}
