/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { OverlayContainer } from "@angular/cdk/overlay";
import { RowActionsComponent } from "./row-actions.component";

describe("Меню действий строки", () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RowActionsComponent);
    fixture.componentRef.setInput("label", "Действия проекта: Финплан");
    fixture.componentRef.setInput("actions", [
      { id: "team", label: "Посмотреть команду" },
      { id: "rate", label: "Перейти к оценке", disabled: true },
    ]);
    const chosen = vi.fn();
    fixture.componentInstance.action.subscribe(chosen);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    return { fixture, trigger, overlay, chosen };
  }
  it("открывает меню в отдельном слое и сообщает действие вместе с триггером строки", () => {
    const { fixture, trigger, overlay, chosen } = setup();
    fixture.nativeElement.style.overflow = "hidden";
    trigger.click();
    fixture.detectChanges();
    const menu = overlay.querySelector('[role="menu"]')!;
    expect(menu).not.toBeNull();
    expect(fixture.nativeElement.contains(menu)).toBe(false);
    (menu.querySelector("button") as HTMLButtonElement).click();
    expect(chosen).toHaveBeenCalledWith({ id: "team", trigger });
  });
  it("не запускает запрещенное действие", () => {
    const { fixture, trigger, overlay, chosen } = setup();
    trigger.click();
    fixture.detectChanges();
    const disabled = overlay.querySelector('[aria-disabled="true"]') as HTMLButtonElement;
    expect(disabled.textContent).toContain("Перейти к оценке");
    disabled.click();
    expect(chosen).not.toHaveBeenCalled();
  });
  it("закрывается по Escape и возвращает фокус кнопке своей строки", () => {
    const { fixture, trigger, overlay } = setup();
    trigger.focus();
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", keyCode: 40, bubbles: true }),
    );
    fixture.detectChanges();
    const menu = overlay.querySelector('[role="menu"]') as HTMLElement;
    expect(menu).not.toBeNull();
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", keyCode: 27, bubbles: true }));
    fixture.detectChanges();
    expect(overlay.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
