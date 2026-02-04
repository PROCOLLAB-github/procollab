/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterComponent } from "./register.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../../../auth/services";
import { InputComponent } from "@ui/components";
import { NgxMaskModule } from "ngx-mask";
import { RouterTestingModule } from "@angular/router/testing";

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", ["login", "memTokens", "clearTokens"]);

    return await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NgxMaskModule.forRoot(),
        RegisterComponent,
        InputComponent,
      ],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
