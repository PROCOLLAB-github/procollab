/** @format */

import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ButtonDirective } from "./button.directive";

@Component({
  imports: [ButtonDirective],
  template:
    '<button appButton="primary" [disabled]="disabled()" [appButtonLoading]="loading()">Сохранить</button><a appButton="secondary" href="/next" [disabled]="disabled()">Открыть</a>',
})
class NativeButtonHost {
  readonly disabled = signal(false);
  readonly loading = signal(false);
}

describe("Button native semantics", () => {
  it("keeps native button disabling and prevents disabled link navigation without unsupported property bindings", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(NativeButtonHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const link = fixture.nativeElement.querySelector("a") as HTMLAnchorElement;
    expect(button.disabled).toBe(false);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(link.hasAttribute("disabled")).toBe(false);
    expect(link.getAttribute("aria-disabled")).toBe("true");
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    fixture.componentInstance.disabled.set(false);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
    expect(errors.mock.calls.flat().join(" ")).not.toContain("NG0303");
    errors.mockRestore();
  });
});
