/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RatingCardComponent } from "./rating-card.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("RatingCardComponent", () => {
  let component: RatingCardComponent;
  let fixture: ComponentFixture<RatingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingCardComponent, HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
