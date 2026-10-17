/** @format */

import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ImageFraming, ImageFramingDirective } from "./image-framing.directive";

@Component({
  imports: [ImageFramingDirective],
  template: '<img [appImageFraming]="frame()" alt="test" />',
})
class Host {
  readonly frame = signal<Partial<ImageFraming> | null>(null);
}

describe("Shared image framing", () => {
  it("center defaults and matching origin keep the chosen crop when zooming", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector("img") as HTMLImageElement;
    expect(image.style.objectPosition).toBe("50% 50%");
    expect(image.style.transform).toBe("scale(1)");
    fixture.componentInstance.frame.set({ x: 20, y: 80, zoom: 2 });
    fixture.detectChanges();
    expect(image.style.objectPosition).toBe("20% 80%");
    expect(image.style.transformOrigin).toBe("20% 80%");
    expect(image.style.transform).toBe("scale(2)");
    fixture.componentInstance.frame.set({ x: -500, y: NaN, zoom: Infinity });
    fixture.detectChanges();
    expect(image.style.objectPosition).toBe("0% 50%");
    expect(image.style.transform).toBe("scale(1)");
  });
});
