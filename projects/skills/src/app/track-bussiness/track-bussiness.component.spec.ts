/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TrackBussinessComponent } from "./track-bussiness.component";

describe("TrackBussinessComponent", () => {
  let component: TrackBussinessComponent;
  let fixture: ComponentFixture<TrackBussinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackBussinessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackBussinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
