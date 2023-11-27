/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginComponent } from "./login.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../services";
import { InputComponent } from "@ui/components";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxMaskModule } from "ngx-mask";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", ["login", "memTokens", "clearTokens"]);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NgxMaskModule.forRoot(),
        LoginComponent,
        InputComponent,
      ],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
