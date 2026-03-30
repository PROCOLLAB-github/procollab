/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CircleProgressBarComponent } from "./circle-progress-bar.component";

describe("CircleProgressBarComponent", () => {
  let component: CircleProgressBarComponent;
  let fixture: ComponentFixture<CircleProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircleProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CircleProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
