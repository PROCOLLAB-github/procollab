/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TrajectoriesListComponent } from "./list.component";

describe("TrajectoriesListComponent", () => {
  let component: TrajectoriesListComponent;
  let fixture: ComponentFixture<TrajectoriesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrajectoriesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrajectoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
