/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RateProjectsComponent } from "./rate-projects.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("RateProjectsComponent", () => {
  let component: RateProjectsComponent;
  let fixture: ComponentFixture<RateProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, RateProjectsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RateProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
