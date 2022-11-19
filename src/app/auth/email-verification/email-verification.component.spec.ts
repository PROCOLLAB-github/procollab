/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmailVerificationComponent } from "./email-verification.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("EmailVerificationComponent", () => {
  let component: EmailVerificationComponent;
  let fixture: ComponentFixture<EmailVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [EmailVerificationComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
