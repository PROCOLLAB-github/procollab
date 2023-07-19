/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramDetailMainComponent } from "./main.component";

describe("MainComponent", () => {
  let component: ProgramDetailMainComponent;
  let fixture: ComponentFixture<ProgramDetailMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramDetailMainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramDetailMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
