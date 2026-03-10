/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BarNewComponent } from "./bar.component";

describe("BarNewComponent", () => {
  let component: BarNewComponent;
  let fixture: ComponentFixture<BarNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarNewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
