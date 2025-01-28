/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TrackCareerComponent } from "./track-career.component";

describe("TrackCareerComponent", () => {
  let component: TrackCareerComponent;
  let fixture: ComponentFixture<TrackCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackCareerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
