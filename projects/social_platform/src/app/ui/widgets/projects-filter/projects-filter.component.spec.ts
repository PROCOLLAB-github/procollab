/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectsFilterComponent } from "./projects-filter.component";
import { provideRouter, Router } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { signal } from "@angular/core";
import { ProjectsFilterInfoService } from "./service/projects-filter-info.service";

describe("ProjectsFilterComponent", () => {
  let component: ProjectsFilterComponent;
  let fixture: ComponentFixture<ProjectsFilterComponent>;

  beforeEach(async () => {
    const industrySpy = {
      industries: signal([{ id: 5, name: "EdTech" }]),
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

  it("сохраняет справочник отраслей и фильтрацию через query-параметр industry", async () => {
    await fixture.whenStable();
    const service = fixture.debugElement.injector.get(ProjectsFilterInfoService);
    expect(service.industries()).toEqual([{ id: 5, label: "EdTech", value: "EdTech" }]);
    const navigate = vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
    component.onFilterByIndustry(5);
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { industry: 5 },
        queryParamsHandling: "merge",
      }),
    );
    vi.restoreAllMocks();
  });
});
