/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramRegisterComponent } from "./register.component";

describe("RegisterComponent", () => {
  let component: ProgramRegisterComponent;
  let fixture: ComponentFixture<ProgramRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramRegisterComponent],
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
