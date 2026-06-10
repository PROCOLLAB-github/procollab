/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacancyFilterComponent } from "./vacancy-filter.component";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { of } from "rxjs";

describe("FeedComponent", () => {
  let component: VacancyFilterComponent;
  let fixture: ComponentFixture<VacancyFilterComponent>;

  beforeEach(async () => {
    const vacancyRepoSpy = {
      getForProject: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [VacancyFilterComponent, HttpClientTestingModule],
      providers: [{ provide: VacancyRepositoryPort, useValue: vacancyRepoSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyFilterComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
