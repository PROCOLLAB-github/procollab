/** @format */

import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "../loader/loader.component";
import { DesktopLayoutService } from "../../../services/desktop-layout.service";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.scss",
  imports: [CommonModule, LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  protected readonly desktopLayout = inject(DesktopLayoutService).desktop;
  variant = input<"primary" | "secondary" | "danger">();
  color = input<"primary" | "red" | "grey" | "green" | "gold" | "gradient" | "white">("primary");
  loader = input(false);
  size = input<"extra-small" | "small" | "medium" | "big">("small");
  hasBorder = input(true);
  type = input<"submit" | "reset" | "button" | "icon">("button");
  appearance = input<"inline" | "outline">("inline");
  backgroundColor = input<string>();
  disabled = input(false);
  customTypographyClass = input<string>();
  protected readonly effectiveColor = computed(() =>
    this.variant() === "danger" ? "red" : this.color(),
  );
  protected readonly effectiveAppearance = computed(() =>
    this.variant() === "secondary" ? "outline" : this.appearance(),
  );
}
