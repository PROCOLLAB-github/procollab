/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClosedVacancyComponent } from "./closed-vacancy.component";

describe("OpenVacancyComponent", () => {
  let component: ClosedVacancyComponent;
  let fixture: ComponentFixture<ClosedVacancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClosedVacancyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClosedVacancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
