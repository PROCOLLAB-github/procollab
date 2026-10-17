/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AvatarComponent } from "./avatar.component";

describe("AvatarComponent", () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();
  });

  it("framing is opt-in and keeps circle border, online badge and progress outside the clipped image", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    fixture.componentRef.setInput("url", "https://example.com/logo.png");
    fixture.componentRef.setInput("imageFraming", { x: 10, y: 70, zoom: 2 });
    fixture.componentRef.setInput("hasBorder", true);
    fixture.componentRef.setInput("isOnline", true);
    fixture.componentRef.setInput("progress", 80);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const crop = element.querySelector(".avatar__crop")!;
    expect((crop.querySelector("img") as HTMLImageElement).style.transform).toBe("scale(2)");
    expect(element.querySelector(".avatar__online")).toBeTruthy();
    expect(element.querySelector(".avatar__progress")).toBeTruthy();
    expect(crop.querySelector(".avatar__online, .avatar__progress")).toBeNull();
    fixture.componentRef.setInput("imageFraming", null);
    fixture.detectChanges();
    expect(element.querySelector(".avatar__crop")).toBeNull();
    expect((element.querySelector("img") as HTMLImageElement).style.transform).toBe("");
  });

  it("should create", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", undefined);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should display placeholder image if no URL is provided", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", undefined);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img");
    expect(img.src).toContain(component.placeholderUrl);
  });

  it("should display provided image if URL is provided", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", "https://example.com/avatar.png");
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img");
    expect(img.src).toContain("https://example.com/avatar.png");
  });

  it("should have correct size", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", undefined);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector(".avatar");
    expect(div.style.width).toBe(component.size() + "px");
    expect(div.style.height).toBe(component.size() + "px");
    const img = fixture.nativeElement.querySelector("img");
    expect(img.style.width).toBe(component.size() + "px");
    expect(img.style.height).toBe(component.size() + "px");
  });

  it("should have border if hasBorder is true", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", undefined);
    fixture.componentRef.setInput("hasBorder", true);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector(".avatar");
    expect(div.classList.contains("avatar--border")).toBe(true);
  });

  it("should not have border if hasBorder is false", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", undefined);
    fixture.componentRef.setInput("hasBorder", false);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector(".avatar");
    expect(div.classList.contains("avatar--border")).toBe(false);
  });
});
