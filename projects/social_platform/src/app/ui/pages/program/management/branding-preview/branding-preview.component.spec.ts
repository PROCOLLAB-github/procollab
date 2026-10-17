/** @format */

import { TestBed } from "@angular/core/testing";
import { AVATAR_PLACEHOLDER_URL } from "@uilib";
import { PROGRAM_DEFAULT_COVER } from "@utils/program-branding";
import { ProgramBrandingPreviewComponent } from "./branding-preview.component";

describe("Предпросмотр оформления программы", () => {
  function setup() {
    const fixture = TestBed.createComponent(ProgramBrandingPreviewComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const cover = () => element.querySelector<HTMLImageElement>(".branding-preview__cover-image")!;
    const logo = () => element.querySelector<HTMLImageElement>(".branding-preview__logo")!;
    return { fixture, element, cover, logo };
  }

  it("отображает draft, удаление возвращает те же заглушки, что на странице программы", () => {
    const { fixture, cover, logo } = setup();
    fixture.componentRef.setInput("cover", "https://example.com/draft-cover.png");
    fixture.componentRef.setInput("logo", "https://example.com/draft-logo.png");
    fixture.detectChanges();
    expect(cover().src).toBe("https://example.com/draft-cover.png");
    expect(logo().src).toBe("https://example.com/draft-logo.png");
    fixture.componentRef.setInput("cover", null);
    fixture.componentRef.setInput("logo", null);
    fixture.detectChanges();
    expect(cover().getAttribute("src")).toBe(PROGRAM_DEFAULT_COVER);
    expect(logo().src).toBe(AVATAR_PLACEHOLDER_URL);
  });

  it("режим экрана доступен кнопками и сохраняется при изменении изображений", () => {
    const { fixture, element } = setup();
    const buttons = element.querySelectorAll<HTMLButtonElement>("button");
    buttons[1].click();
    fixture.detectChanges();
    expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("true");
    expect(Array.from(buttons, button => button.type)).toEqual(["button", "button"]);
    expect(element.textContent).toContain("экрана 360 px");
    fixture.componentRef.setInput("cover", "https://example.com/new.png");
    window.dispatchEvent(new Event("resize"));
    fixture.detectChanges();
    expect(fixture.componentInstance.device()).toBe("mobile");
    buttons[0].click();
    fixture.detectChanges();
    expect(element.textContent).toContain("экрана 1440 px");
  });

  it("показывает busy и ошибку изображения, не изменяя URL; замена очищает ошибку", () => {
    const { fixture, element, cover } = setup();
    fixture.componentRef.setInput("cover", "https://example.com/broken.png");
    fixture.componentRef.setInput("busy", true);
    fixture.detectChanges();
    expect(element.querySelector("section")!.getAttribute("aria-busy")).toBe("true");
    expect(element.querySelector('[role="status"]')!.textContent).toContain("Загружаем");
    cover().dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')!.textContent).toContain("обложку");
    expect(cover().src).toBe("https://example.com/broken.png");
    fixture.componentRef.setInput("cover", "https://example.com/working.png");
    fixture.componentRef.setInput("busy", false);
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it("масштабируется по доступной ширине и отключает observer при уничтожении", () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    let resized = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    try {
      const { fixture, element } = setup();
      const viewport = element.querySelector<HTMLElement>(".branding-preview__viewport")!;
      Object.defineProperty(viewport, "clientWidth", { value: 300 });
      resized();
      fixture.detectChanges();
      expect(fixture.componentInstance.stageWidth()).toBeCloseTo(300);
      expect(observe).toHaveBeenCalledTimes(2);
      fixture.destroy();
      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
