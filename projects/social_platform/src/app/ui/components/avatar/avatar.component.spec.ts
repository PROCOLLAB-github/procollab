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

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display placeholder image if no URL is provided", () => {
    const img = fixture.nativeElement.querySelector("img");
    expect(img.src).toContain(component.placeholderUrl);
  });

  it("should display provided image if URL is provided", () => {
    component.url = "https://example.com/avatar.png";
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img");
    expect(img.src).toContain(component.url);
  });

  it("should have correct size", () => {
    const div = fixture.nativeElement.querySelector(".avatar");
    expect(div.style.width).toBe(component.size + "px");
    expect(div.style.height).toBe(component.size + "px");
    const img = fixture.nativeElement.querySelector("img");
    expect(img.style.width).toBe(component.size + "px");
    expect(img.style.height).toBe(component.size + "px");
  });

  it("should have border if hasBorder is true", () => {
    component.hasBorder = true;
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector(".avatar");
    expect(div.classList.contains("avatar--border")).toBeTrue();
  });

  it("should not have border if hasBorder is false", () => {
    component.hasBorder = false;
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector(".avatar");
    expect(div.classList.contains("avatar--border")).toBeFalse();
  });
});
