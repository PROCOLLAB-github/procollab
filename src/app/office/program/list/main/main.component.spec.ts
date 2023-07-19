/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramMainComponent } from "./main.component";

describe("MainComponent", () => {
  let component: ProgramMainComponent;
  let fixture: ComponentFixture<ProgramMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramMainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
