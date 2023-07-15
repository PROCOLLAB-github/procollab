/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramDetailComponent } from "./detail.component";

describe("DetailComponent", () => {
  let component: ProgramDetailComponent;
  let fixture: ComponentFixture<ProgramDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramDetailComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
