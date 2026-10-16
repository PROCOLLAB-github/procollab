/** @format */

import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ButtonComponent } from "./button.component";
import { ButtonDirective } from "./button.directive";
import { ButtonComponent as LegacyButton } from "@ui/primitives/button/button.component";

@Component({
  imports: [ButtonComponent, ButtonDirective],
  template: `<app-button [loader]="loading()" (click)="calls = calls + 1">Сохранить</app-button>
    <button appButton="primary" [appButtonLoading]="loading()" (click)="calls = calls + 1">
      Отправить
    </button>`,
})
class Host {
  loading = signal(true);
  calls = 0;
}

describe("Shared Button states", () => {
  it("blocks repeated submissions during loading and preserves the accessible action name", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = [...fixture.nativeElement.querySelectorAll("button")];
    buttons.forEach(button => {
      button.click();
      expect(button.disabled).toBe(true);
      expect(button.getAttribute("aria-busy")).toBe("true");
    });
    expect(buttons[0].textContent).toContain("Сохранить");
    expect(fixture.componentInstance.calls).toBe(0);
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    buttons.forEach(button => button.click());
    expect(fixture.componentInstance.calls).toBe(2);
  });
  it("keeps both historical import paths on the same Angular class", () => {
    expect(LegacyButton).toBe(ButtonComponent);
  });
});
