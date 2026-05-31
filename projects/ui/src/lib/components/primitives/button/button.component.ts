/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "../loader/loader.component";

@Component({
    selector: "app-button",
    templateUrl: "./button.component.html",
    styleUrl: "./button.component.scss",
    imports: [CommonModule, LoaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  color = input<"primary" | "red" | "grey" | "green" | "gold" | "gradient" | "white">("primary");
  loader = input(false);
  size = input<"extra-small" | "small" | "medium" | "big">("small");
  hasBorder = input(true);
  type = input<"submit" | "reset" | "button" | "icon">("button");
  appearance = input<"inline" | "outline">("inline");
  backgroundColor = input<string>();
  disabled = input(false);
  customTypographyClass = input<string>();
}
