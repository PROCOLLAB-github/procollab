/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SetPasswordComponent } from "./set-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "@auth/services";
import { of } from "rxjs";
import { NgxMaskModule } from "ngx-mask";

describe("SetPasswordComponent", () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj({ setPassword: of({}) });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
        SetPasswordComponent,
      ],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
