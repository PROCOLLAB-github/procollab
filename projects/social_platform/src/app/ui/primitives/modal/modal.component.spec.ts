/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OverlayModule } from "@angular/cdk/overlay";
import { Component, ViewChild } from "@angular/core";
import { ModalComponent } from "./modal.component";

@Component({
  template: `
    <app-modal [open]="open" (openChange)="onOpenChange($event)">
      <div class="content">Hello, world!</div>
    </app-modal>
  `,
  imports: [OverlayModule],
})
class TestHostComponent {
  @ViewChild(ModalComponent) modalComponent!: ModalComponent;
  open = false;
  onOpenChange(value: boolean) {
    this.open = value;
  }
}

describe("ModalComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, ModalComponent],
      declarations: [TestHostComponent],
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

  it("should create the modal overlay when modalTemplate is available", () => {
    hostComponent.modalComponent.modalTemplate = {} as any;
    hostComponent.modalComponent.ngAfterViewInit();
    expect(hostComponent.modalComponent.overlayRef).toBeTruthy();
  });
});
