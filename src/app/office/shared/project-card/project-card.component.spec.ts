/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectCardComponent } from "./project-card.component";
import { of } from "rxjs";
import { IndustryService } from "../../services/industry.service";
import { Project } from "../../models/project.model";

describe("ProjectCardComponent", () => {
  let component: ProjectCardComponent;
  let fixture: ComponentFixture<ProjectCardComponent>;

  beforeEach(async () => {
    const industrySpy = jasmine.createSpyObj([{ industries: of([]) }]);

    await TestBed.configureTestingModule({
      providers: [{ provide: IndustryService, useValue: industrySpy }],
      declarations: [ProjectCardComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCardComponent);

    component = fixture.componentInstance;
    component.project = Project.default();

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
