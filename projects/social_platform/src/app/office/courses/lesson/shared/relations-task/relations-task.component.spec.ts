/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RelationsTaskComponent } from "./relations-task.component";

describe("RelationsTaskComponent", () => {
  let component: RelationsTaskComponent;
  let fixture: ComponentFixture<RelationsTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationsTaskComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RelationsTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
