/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacanciesListComponent } from "./list.component";

describe("VacanciesListComponent", () => {
  let component: VacanciesListComponent;
  let fixture: ComponentFixture<VacanciesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacanciesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VacanciesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
