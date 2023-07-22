/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramProjectsComponent } from "./projects.component";

describe("ProjectsComponent", () => {
  let component: ProgramProjectsComponent;
  let fixture: ComponentFixture<ProgramProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramProjectsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
