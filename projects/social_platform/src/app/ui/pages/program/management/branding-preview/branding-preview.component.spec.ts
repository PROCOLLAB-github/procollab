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
    const buttons = element.querySelectorAll<HTMLButtonElement>(
      '[aria-label="Экран предпросмотра"] button',
    );
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

  it("отдельный mobile source и frame не меняют desktop; общий logo редактируется независимо", () => {
    const { fixture, element, cover, logo } = setup();
    fixture.componentInstance.device.set("desktop");
    fixture.componentRef.setInput("cover", "https://example.com/desktop.png");
    fixture.componentRef.setInput("mobileCover", "https://example.com/mobile.png");
    fixture.componentRef.setInput("logo", "https://example.com/logo.png");
    fixture.componentInstance.framingChange.subscribe(value =>
      fixture.componentRef.setInput("framing", value),
    );
    fixture.detectChanges();
    const slider = element.querySelector<HTMLInputElement>('input[type="range"]')!;
    slider.value = "1.8";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();
    expect(cover().style.transform).toBe("scale(1.8)");
    fixture.componentInstance.device.set("mobile");
    fixture.detectChanges();
    expect(cover().src).toBe("https://example.com/mobile.png");
    expect(slider.value).toBe("1");
    element.querySelector<HTMLElement>(".branding-preview__cover-frame")!.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowLeft",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(cover().style.objectPosition).toBe("60% 50%");
    fixture.componentInstance.target.set("logo");
    fixture.componentInstance.move(-10, 20);
    fixture.detectChanges();
    expect(logo().style.objectPosition).toBe("40% 70%");
    expect(fixture.componentInstance.frames().cover.zoom).toBe(1.8);
    fixture.componentRef.setInput("mobileCover", null);
    fixture.detectChanges();
    expect(cover().src).toBe("https://example.com/desktop.png");
    expect(cover().style.objectPosition).toBe("60% 50%");
  });

  it("drag учитывает zoom, ограничивает края, busy блокирует правки; reset не меняет остальные кадры", () => {
    const { fixture, element, cover } = setup();
    const component = fixture.componentInstance;
    component.device.set("desktop");
    fixture.componentRef.setInput("cover", "https://example.com/cover.png");
    fixture.componentRef.setInput("framing", { cover: { x: 50, y: 50, zoom: 2 } });
    const changed = vi.fn(value => fixture.componentRef.setInput("framing", value));
    component.framingChange.subscribe(changed);
    fixture.detectChanges();
    const frame = element.querySelector<HTMLElement>(".branding-preview__cover-frame")!;
    Object.defineProperties(frame, { clientWidth: { value: 400 }, clientHeight: { value: 100 } });
    Object.defineProperties(cover(), {
      naturalWidth: { value: 1000 },
      naturalHeight: { value: 500 },
    });
    function pointer(type: string, x: number, y: number) {
      const event = new MouseEvent(type, {
        clientX: x,
        clientY: y,
        button: 0,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "pointerId", { value: 1 });
      frame.dispatchEvent(event);
      fixture.detectChanges();
    }
    pointer("pointerdown", 100, 50);
    pointer("pointermove", 150, 80);
    expect(component.frames().cover).toEqual({ x: 37.5, y: 40, zoom: 2 });
    pointer("pointermove", 9999, -9999);
    expect(component.frames().cover).toEqual({ x: 0, y: 100, zoom: 2 });
    pointer("pointerup", 9999, -9999);
    fixture.componentRef.setInput("busy", true);
    fixture.detectChanges();
    changed.mockClear();
    component.move(2, 2);
    component.resetFrame();
    expect(changed).not.toHaveBeenCalled();
    fixture.componentRef.setInput("busy", false);
    fixture.detectChanges();
    component.resetFrame();
    fixture.detectChanges();
    expect(component.frames().cover).toEqual({ x: 50, y: 50, zoom: 1 });
    expect(component.frames().mobileCover).toEqual({ x: 50, y: 50, zoom: 1 });
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
