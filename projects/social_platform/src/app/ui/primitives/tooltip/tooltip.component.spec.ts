/** @format */

import { OverlayContainer } from "@angular/cdk/overlay";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ButtonComponent } from "../button/button.component";
import { TooltipComponent } from "./tooltip.component";

@Component({
  template: `
    <app-button [disabled]="true" appearance="outline" size="medium">
      <span>аналитика</span>
      <app-tooltip
        text="Скоро здесь будет аналитика"
        [isVisible]="isVisible"
        [tooltipWidth]="180"
        [useOverlay]="true"
        (show)="isVisible = true"
        (hide)="isVisible = false"
      ></app-tooltip>
    </app-button>
  `,
  imports: [ButtonComponent, TooltipComponent],
})
class TooltipOverlayHostComponent {
  isVisible = false;
}

describe("TooltipComponent overlay mode", () => {
  let fixture: ComponentFixture<TooltipOverlayHostComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipOverlayHostComponent],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    fixture = TestBed.createComponent(TooltipOverlayHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    fixture.destroy();
  });

  it("should use overlay mode for analytics tooltip", () => {
    const tooltip = fixture.debugElement.query(By.directive(TooltipComponent)).componentInstance;

    expect(tooltip.useOverlay()).toBe(true);
  });

  it("should keep the tooltip icon inline inside the button after the text", () => {
    const button = fixture.debugElement.query(By.css("button")).nativeElement as HTMLButtonElement;
    const text = button.querySelector("span");
    const tooltip = button.querySelector("app-tooltip");

    expect(button.disabled).toBe(true);
    expect(text?.textContent?.trim()).toBe("аналитика");
    expect(tooltip).toBeTruthy();
    expect(text?.compareDocumentPosition(tooltip!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("should create and remove overlay popup on hover", () => {
    const icon = fixture.debugElement.query(By.css("app-tooltip .tooltip__icon")).nativeElement;

    icon.dispatchEvent(new MouseEvent("mouseenter"));
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain("Скоро здесь будет аналитика");
    expect(overlayContainerElement.querySelector(".tooltip__content--overlay")).toBeTruthy();

    icon.dispatchEvent(new MouseEvent("mouseleave"));
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).not.toContain("Скоро здесь будет аналитика");
  });
});
