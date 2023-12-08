/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MembersFiltersComponent } from "./members-filters.component";

describe("MembersFiltersComponent ", () => {
  let component: MembersFiltersComponent;
  let fixture: ComponentFixture<MembersFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersFiltersComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersFiltersComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
