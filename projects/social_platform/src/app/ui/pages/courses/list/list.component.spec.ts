/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WebinarsListComponent } from "./list.component";

describe("WebinarsListComponent", () => {
  let component: WebinarsListComponent;
  let fixture: ComponentFixture<WebinarsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebinarsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebinarsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
