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

  it("should create", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", "");
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should display placeholder image if no URL is provided", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", "");
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
    fixture.componentRef.setInput("url", "");
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img");
    expect(img.style.width).toBe(component.size() + "px");
    expect(img.style.height).toBe(component.size() + "px");
  });

  it("should have border if hasBorder is true", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", "");
    fixture.componentRef.setInput("hasBorder", true);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector(".avatar > div");
    expect(div.classList.contains("avatar--border")).toBeTrue();
  });

  it("should not have border if hasBorder is false", () => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("url", "");
    fixture.componentRef.setInput("hasBorder", false);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector(".avatar > div");
    expect(div.classList.contains("avatar--border")).toBeFalse();
  });
});
