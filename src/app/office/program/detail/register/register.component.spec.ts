/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramRegisterComponent } from "./register.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("RegisterComponent", () => {
  let component: ProgramRegisterComponent;
  let fixture: ComponentFixture<ProgramRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule, ProgramRegisterComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
