/** @format */

import { Injectable, signal } from "@angular/core";

/** Переключение видимости группы полей формы. */
@Injectable()
export class ToggleFieldsInfoService {
  readonly showInputFields = signal<boolean>(false);

  showFields(): void {
    this.showInputFields.set(true);
  }

  hideFields(): void {
    this.showInputFields.set(false);
  }
}
