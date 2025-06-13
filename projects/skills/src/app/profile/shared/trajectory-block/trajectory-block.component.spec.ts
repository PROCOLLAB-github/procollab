/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TrajectoryBlockComponent } from "./trajectory-block.component";

describe("TrajectoryBlockComponent", () => {
  let component: TrajectoryBlockComponent;
  let fixture: ComponentFixture<TrajectoryBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrajectoryBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrajectoryBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
