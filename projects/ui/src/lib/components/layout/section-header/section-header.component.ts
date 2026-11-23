/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
@Component({
  selector: "app-section-header",
  template: `<header class="section-header">
    <div class="section-header__heading">
      <h2 [attr.id]="titleId()">{{ title() }}</h2>
      <ng-content select="[sectionHeaderAction]" />
    </div>
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
    .section-header__heading {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      align-items: center;
      width: 100%;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--accent);
    }
    h2 {
      flex: 1 1 12ch;
      min-width: 0;
      margin: 0;
      font-size: 16px;
      line-height: 24px;
      font-weight: 600;
      color: var(--accent-text);
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
  readonly titleId = input<string>();
  readonly description = input<string>();
}
