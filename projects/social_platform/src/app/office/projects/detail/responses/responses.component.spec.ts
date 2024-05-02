/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectResponsesComponent } from "./responses.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

describe("ProjectResponsesComponent", () => {
  let component: ProjectResponsesComponent;
  let fixture: ComponentFixture<ProjectResponsesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ProjectResponsesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
