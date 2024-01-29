/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FeedFilterComponent } from "./feed-filter.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("FeedComponent", () => {
  let component: FeedFilterComponent;
  let fixture: ComponentFixture<FeedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedFilterComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
