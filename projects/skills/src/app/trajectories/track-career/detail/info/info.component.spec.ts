/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TrajectoryInfoComponent } from "./info.component";

describe("TrajectoryInfoComponent", () => {
  let component: TrajectoryInfoComponent;
  let fixture: ComponentFixture<TrajectoryInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrajectoryInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrajectoryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
