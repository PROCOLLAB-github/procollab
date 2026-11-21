/** @format */

import { TestBed } from "@angular/core/testing";
import { DialogHeaderComponent } from "./dialog-header.component";
describe("DialogHeaderComponent", () => {
  it("emits close and preserves disabled and accessible label", async () => {
    await TestBed.configureTestingModule({ imports: [DialogHeaderComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DialogHeaderComponent);
    fixture.componentRef.setInput("title", "Предпросмотр");
    fixture.componentRef.setInput("closeLabel", "Закрыть предпросмотр");
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    expect(button.getAttribute("aria-label")).toBe("Закрыть предпросмотр");
    button.click();
    expect(closed).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput("closeDisabled", true);
    fixture.detectChanges();
    button.click();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("marks the title for initial focus and keeps close keyboard-accessible", async () => {
    await TestBed.configureTestingModule({ imports: [DialogHeaderComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DialogHeaderComponent);
    fixture.componentRef.setInput("title", "Вы зарегистрированы на программу");
    fixture.componentRef.setInput("initialFocusOnTitle", true);
    fixture.detectChanges();

    const heading: HTMLHeadingElement = fixture.nativeElement.querySelector("h2");
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(heading.hasAttribute("cdkFocusInitial")).toBe(true);
    expect(button.hasAttribute("cdkFocusInitial")).toBe(false);
    expect(button.tabIndex).toBe(0);
  });
});
