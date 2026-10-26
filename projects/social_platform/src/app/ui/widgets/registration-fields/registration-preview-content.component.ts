/** @format */
import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";
import { ButtonDirective } from "@uilib";
import { RegistrationField } from "@domain/program/program-registration.model";
import { registrationControls, RegistrationFieldsComponent } from "./registration-fields.component";

/** The same questionnaire preview in settings and first-publication flow. */
@Component({
  selector: "app-registration-preview-content",
  imports: [ButtonDirective, RegistrationFieldsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="preview__devices">
      <button
        appButton="secondary"
        type="button"
        [attr.aria-pressed]="!mobile()"
        (click)="mobile.set(false)"
      >
        Компьютер</button
      ><button
        appButton="secondary"
        type="button"
        [attr.aria-pressed]="mobile()"
        (click)="mobile.set(true)"
      >
        Телефон
      </button>
    </div>
    <div class="preview__form" [class.preview__form--mobile]="mobile()">
      <h3>Анкета участника</h3>
      <app-registration-fields prefix="preview" [fields]="fields()" [group]="group()" /><button
        appButton="primary"
        type="button"
        disabled
      >
        Зарегистрироваться
      </button>
    </div>
    <p>Это предпросмотр. Аккаунт и участие не создаются.</p>`,
  styles: `
    @use "styles/ui-foundation";
    @use "styles/program-management-controls";
    :host {
      display: grid;
      gap: 20px;
      min-width: 0;
    }
    .ui-button.ui-button {
      @include ui-foundation.button;
      @include program-management-controls.compact-action;
    }
    h3 {
      margin: 0;
      font-size: 14px;
      line-height: 21px;
      font-weight: 600;
    }
    p {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--grey-for-text);
    }
    .preview__devices {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .preview__form {
      display: grid;
      gap: 20px;
      width: 100%;
      padding: 16px;
      margin: auto;
    }
    .preview__form--mobile {
      max-width: 390px;
      background: var(--white);
      border-radius: 15px;
    }
  `,
})
export class RegistrationPreviewContentComponent {
  readonly fields = input.required<RegistrationField[]>();
  readonly group = input.required<ReturnType<typeof registrationControls>>();
  readonly mobile = signal(false);
}
