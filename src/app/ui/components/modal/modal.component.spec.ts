/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ModalComponent } from "./modal.component";

describe("ModalComponent", () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should not show the modal when open is false", () => {
    const modalOverlay = fixture.nativeElement.querySelector(".modal__overlay");
    expect(modalOverlay).toBeNull();
    const modalBody = fixture.nativeElement.querySelector(".modal__body");
    expect(modalBody).toBeNull();
  });

  it("should show the modal when open is true", () => {
    component.open = true;
    fixture.detectChanges();
    const modalOverlay = fixture.nativeElement.querySelector(".modal__overlay");
    expect(modalOverlay).not.toBeNull();
    const modalBody = fixture.nativeElement.querySelector(".modal__body");
    expect(modalBody).not.toBeNull();
  });

  it("should emit openChange event when modal is closed", () => {
    spyOn(component.openChange, "emit");
    component.open = true;
    fixture.detectChanges();
    const modalOverlay = fixture.nativeElement.querySelector(".modal__overlay");
    modalOverlay.click();
    expect(component.openChange.emit).toHaveBeenCalledWith(false);
  });
});
