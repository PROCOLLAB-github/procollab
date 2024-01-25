/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OpenVacancyComponent } from "./open-vacancy.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("OpenVacancyComponent", () => {
  let component: OpenVacancyComponent;
  let fixture: ComponentFixture<OpenVacancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenVacancyComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenVacancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
