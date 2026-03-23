/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacancyFilterComponent } from "./vacancy-filter.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("FeedComponent", () => {
  let component: VacancyFilterComponent;
  let fixture: ComponentFixture<VacancyFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyFilterComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyFilterComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
