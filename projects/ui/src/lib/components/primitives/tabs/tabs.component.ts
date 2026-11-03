/** @format */

import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { IconComponent } from "../icon/icon.component";

export interface TabItem {
  link?: string;
  linkText: string;
  isRouterLinkActiveOptions?: boolean;
  iconName?: string;
  count?: number;
  disabled?: boolean;
  id?: string;
}

@Component({
  selector: "app-tabs",
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav
      class="tabs"
      [class.tabs--steps]="appearance() === 'steps'"
      [class.tabs--underline]="appearance() === 'underline'"
      [attr.aria-label]="label()"
    >
      @for (item of items(); track $index) {
        @if (item.link && !item.disabled) {
          <a
            class="tabs__item"
            [routerLink]="item.link"
            routerLinkActive="tabs__item--active"
            [routerLinkActiveOptions]="{ exact: !!item.isRouterLinkActiveOptions }"
            ariaCurrentWhenActive="page"
          >
            @if (item.iconName) {
              <i appIcon [icon]="item.iconName" appSquare="16" aria-hidden="true"></i>
            }
            {{ item.linkText }}
            @if (showCounts() && item.count !== undefined) {
              <span class="tabs__count">{{ item.count }}</span>
            }
          </a>
        } @else {
          <button
            type="button"
            class="tabs__item"
            [class.tabs__item--active]="active() === (item.id || item.linkText)"
            [disabled]="item.disabled"
            [attr.aria-pressed]="active() === (item.id || item.linkText)"
            (click)="selected.emit(item.id || item.linkText)"
          >
            @if (item.iconName) {
              <i appIcon [icon]="item.iconName" appSquare="16" aria-hidden="true"></i>
            }
            {{ item.linkText }}
          </button>
        }
      }
    </nav>
  `,
  styleUrl: "./tabs.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private lastActive: Element | null = null;
  private lastWidth = 0;

  constructor() {
    afterEveryRender(() => {
      const nav = this.element.nativeElement.querySelector<HTMLElement>(".tabs");
      const active = nav?.querySelector<HTMLElement>(
        "[aria-current='page'], [aria-pressed='true']",
      );
      if (!nav || !active || !nav.clientWidth) return;
      if (active === this.lastActive && nav.clientWidth === this.lastWidth) return;
      this.lastActive = active;
      this.lastWidth = nav.clientWidth;
      const bounds = nav.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.left < bounds.left) nav.scrollLeft += item.left - bounds.left;
      else if (item.right > bounds.right) nav.scrollLeft += item.right - bounds.right;
    });
  }

  readonly items = input.required<TabItem[]>();
  readonly showCounts = input(false);
  readonly label = input("Разделы");
  readonly active = input<string>();
  readonly selected = output<string>();
  readonly appearance = input<"default" | "steps" | "underline">("default");
}
