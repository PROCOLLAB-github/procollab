/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmPasswordResetComponent } from "./confirm-password-reset.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("ConfirmPasswordResetComponent", () => {
  let component: ConfirmPasswordResetComponent;
  let fixture: ComponentFixture<ConfirmPasswordResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, ConfirmPasswordResetComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
