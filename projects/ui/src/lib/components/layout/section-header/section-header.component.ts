/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
@Component({
  selector: "app-section-header",
  template: `<header class="section-header">
    <h2>{{ title() }}</h2>
    @if (description()) {
      <p>{{ description() }}</p>
    }
    <ng-content />
  </header>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .section-header {
      display: grid;
      justify-items: start;
      gap: 16px;
      min-width: 0;
    }
    h2 {
      margin: 0;
      width: 100%;
      padding-bottom: 16px;
      font-size: 16px;
      line-height: 24px;
      font-weight: 600;
      color: var(--accent-text);
      border-bottom: 1px solid var(--accent);
      overflow-wrap: anywhere;
    }
    p {
      margin: 0;
      color: var(--grey-for-text);
      font-size: 12px;
      line-height: 1.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
