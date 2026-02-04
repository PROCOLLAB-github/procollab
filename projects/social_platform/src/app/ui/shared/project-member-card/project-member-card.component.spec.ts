/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectMemberCardComponent } from "./project-member-card.component";

describe("ProjectMemberCardComponent", () => {
  let component: ProjectMemberCardComponent;
  let fixture: ComponentFixture<ProjectMemberCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectMemberCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectMemberCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
