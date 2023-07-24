/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramHeadComponent } from "./program-head.component";
import { RouterTestingModule } from "@angular/router/testing";
import { Program } from "@office/program/models/program.model";

describe("ProgramHeadComponent", () => {
  let component: ProgramHeadComponent;
  let fixture: ComponentFixture<ProgramHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProgramHeadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramHeadComponent);
    component = fixture.componentInstance;
    component.program = Program.default();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
