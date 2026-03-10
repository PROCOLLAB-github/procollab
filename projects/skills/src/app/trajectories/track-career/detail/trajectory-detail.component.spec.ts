/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TrajectoryDetailComponent } from "./trajectory-detail.component";

describe("TrajectoryDetailComponent", () => {
  let component: TrajectoryDetailComponent;
  let fixture: ComponentFixture<TrajectoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrajectoryDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrajectoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
