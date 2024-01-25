/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClosedVacancyComponent } from "./closed-vacancy.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("OpenVacancyComponent", () => {
  let component: ClosedVacancyComponent;
  let fixture: ComponentFixture<ClosedVacancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClosedVacancyComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ClosedVacancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
