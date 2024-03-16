/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramProjectsComponent } from "./projects.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProjectsComponent", () => {
  let component: ProgramProjectsComponent;
  let fixture: ComponentFixture<ProgramProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ProgramProjectsComponent, HttpClientTestingModule],
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
