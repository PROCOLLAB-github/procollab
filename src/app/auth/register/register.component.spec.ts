/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterComponent } from "./register.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../services";
import { InputComponent } from "../../ui/components";
import { CoreModule } from "../../core/core.module";
import { UiModule } from "src/app/ui/ui.module";
import { NgxMaskModule } from "ngx-mask";

describe("LoginComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", ["login", "memTokens"]);

    return await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, CoreModule, UiModule, NgxMaskModule.forRoot()],
      providers: [{ provide: AuthService, useValue: authSpy }],
      declarations: [RegisterComponent, InputComponent],
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
