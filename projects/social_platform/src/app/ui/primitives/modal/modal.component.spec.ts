/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OverlayModule, OverlayContainer } from "@angular/cdk/overlay";
import { Component, signal, ViewChild } from "@angular/core";
import { ModalComponent } from "./modal.component";

@Component({
  template: `
    <app-modal [open]="open()" [labelledBy]="labelledBy()" (openChange)="onOpenChange($event)">
      <div class="content">Hello, world!</div>
    </app-modal>
  `,
  imports: [OverlayModule, ModalComponent],
})
class TestHostComponent {
  @ViewChild(ModalComponent) modalComponent!: ModalComponent;
  readonly open = signal(false);
  readonly labelledBy = signal<string | undefined>(undefined);
  onOpenChange(value: boolean) {
    this.open.set(value);
  }
}

describe("ModalComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, ModalComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it("should create the component", () => {
    expect(hostComponent?.modalComponent).toBeTruthy();
  });

  it("enables named dialog semantics and Escape only when requested", async () => {
    hostComponent.labelledBy.set("dialog-title");
    hostComponent.open.set(true);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const dialog = overlay.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-labelledby")).toBe("dialog-title");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(hostComponent.open()).toBe(false);
  });

  it("keeps the legacy Escape behavior when accessible mode is not enabled", async () => {
    hostComponent.open.set(true);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
    overlay
      .querySelector(".modal__body")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(hostComponent.open()).toBe(true);
  });

  it("should create the modal overlay when modalTemplate is available", () => {
    const mockTplRef = { elementRef: { nativeElement: document.createElement("div") } } as any;
    (hostComponent.modalComponent as any).modalTemplate = () => mockTplRef;
    hostComponent.modalComponent.ngAfterViewInit();
    expect(hostComponent.modalComponent.overlayRef).toBeTruthy();
  });
});
