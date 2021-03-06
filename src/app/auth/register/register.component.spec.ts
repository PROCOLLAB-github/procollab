/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterComponent } from "./register.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../services";
import { InputComponent } from "../../ui/components";

describe("LoginComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", ["login", "memTokens"]);

    return await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
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
