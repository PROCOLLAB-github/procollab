/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectsFilterComponent } from "./projects-filter.component";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { of } from "rxjs";

describe("ProjectsFilterComponent", () => {
  let component: ProjectsFilterComponent;
  let fixture: ComponentFixture<ProjectsFilterComponent>;

  beforeEach(async () => {
    const industrySpy = {
      industries: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ProjectsFilterComponent],
      providers: [{ provide: IndustryRepositoryPort, useValue: industrySpy }, provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
