/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from "@angular/core";
import { CdkMenuModule } from "@angular/cdk/menu";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Params, RouterLink } from "@angular/router";
import { ButtonDirective, IconComponent } from "@uilib";

export interface RowAction {
  id: string;
  label: string;
  disabled?: boolean;
  reason?: string;
  destructive?: boolean;
  routerLink?: string;
  queryParams?: Params;
  href?: string;
}
export interface RowActionEvent {
  id: string;
  trigger: HTMLElement;
}

/** Командное меню строки: CDK управляет фокусом, клавиатурой и слоем overlay. */
@Component({
  selector: "app-row-actions",
  imports: [CdkMenuModule, RouterLink, ButtonDirective, IconComponent],
  templateUrl: "./row-actions.component.html",
  styleUrl: "./row-actions.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowActionsComponent {
  readonly label = input.required<string>();
  readonly actions = input.required<readonly RowAction[]>();
  readonly disabled = input(false);
  readonly action = output<RowActionEvent>();
  readonly opened = output<void>();
  readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>("trigger");
  readonly positions: ConnectedPosition[] = [
    { originX: "end", originY: "bottom", overlayX: "end", overlayY: "top", offsetY: 4 },
    { originX: "end", originY: "top", overlayX: "end", overlayY: "bottom", offsetY: -4 },
  ];
  choose(item: RowAction): void {
    if (!item.disabled) this.action.emit({ id: item.id, trigger: this.trigger().nativeElement });
  }
}
