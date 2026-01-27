/** @format */

import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ToggleFieldsInfoService {
  readonly showInputFields = signal<boolean>(false);

  /**
   * Показывает поля для ввода достижения
   */
  showFields(): void {
    this.showInputFields.set(true);
  }

  /**
   * Скрывает поля ввода и очищает их
   */
  hideFields(): void {
    this.showInputFields.set(false);
  }
}
