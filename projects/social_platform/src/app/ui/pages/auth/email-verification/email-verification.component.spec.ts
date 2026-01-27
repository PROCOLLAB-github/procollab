/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmailVerificationComponent } from "./email-verification.component";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "../../../../auth/services";

describe("EmailVerificationComponent", () => {
  let component: EmailVerificationComponent;
  let fixture: ComponentFixture<EmailVerificationComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj(["memTokens"]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, EmailVerificationComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
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
