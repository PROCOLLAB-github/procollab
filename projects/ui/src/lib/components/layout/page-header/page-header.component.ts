/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BackComponent } from "../../primitives/back/back.component";

export interface PageBreadcrumb {
  label: string;
  link?: string;
}

@Component({
  selector: "app-page-header",
  imports: [BackComponent, RouterLink],
  template: `
    <header class="page-header">
      <div class="page-header__heading">
        @if (breadcrumbs().length) {
          <nav aria-label="Навигационная цепочка" class="page-header__breadcrumbs">
            @for (item of breadcrumbs(); track $index) {
              @if (item.link) {
                <a [routerLink]="item.link">{{ item.label }}</a>
              } @else {
                <span aria-current="page">{{ item.label }}</span>
              }
            }
          </nav>
        }
        <div class="page-header__title-row">
          @if (backRoute()) {
            <app-back [path]="backRoute()" [compact]="true" />
          }
          <h1 class="page-header__title">{{ title() }}</h1>
        </div>
        @if (description()) {
          <p class="page-header__description">{{ description() }}</p>
        }
      </div>
      <div class="page-header__actions"><ng-content /></div>
    </header>
  `,
  styleUrl: "./page-header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly breadcrumbs = input<PageBreadcrumb[]>([]);
  readonly backRoute = input<string>();
}
