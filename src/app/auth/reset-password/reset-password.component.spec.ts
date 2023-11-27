/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ResetPasswordComponent } from "./reset-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxMaskModule } from "ngx-mask";

describe("ResetPasswordComponent", () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj({ resetPassword: of({}) });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        NgxMaskModule.forRoot(),
        ResetPasswordComponent,
      ],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
