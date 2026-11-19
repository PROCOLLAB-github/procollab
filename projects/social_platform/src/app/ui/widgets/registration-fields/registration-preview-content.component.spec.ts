/** @format */
import { TestBed } from "@angular/core/testing";
import { RegistrationPreviewContentComponent } from "./registration-preview-content.component";
import { registrationControls } from "./registration-fields.component";

describe("Предпросмотр анкеты", () => {
  it("показывает выбранный экран и сохраняет отключенную форму при переключении", () => {
    const fixture = TestBed.createComponent(RegistrationPreviewContentComponent);
    const group = registrationControls([]);
    group.disable();
    fixture.componentRef.setInput("fields", []);
    fixture.componentRef.setInput("group", group);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll<HTMLButtonElement>(
      '[aria-label="Экран предпросмотра"] button',
    );
    const form = () => element.querySelector<HTMLElement>(".preview__form")!;
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0].classList.contains("ui-button--primary")).toBe(true);
    expect(buttons[1].classList.contains("ui-button--secondary")).toBe(true);
    buttons[1].click();
    fixture.detectChanges();
    expect(buttons[1].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[1].classList.contains("ui-button--primary")).toBe(true);
    expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
    expect(form().classList.contains("preview__form--mobile")).toBe(true);
    expect(group.disabled).toBe(true);
    expect(form().querySelector<HTMLButtonElement>("button")?.disabled).toBe(true);
    buttons[0].click();
    fixture.detectChanges();
    expect(form().classList.contains("preview__form--mobile")).toBe(false);
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");
  });
});
