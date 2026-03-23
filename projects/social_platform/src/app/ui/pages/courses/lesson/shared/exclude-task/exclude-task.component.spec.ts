/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExcludeTaskComponent } from "./exclude-task.component";

describe("ExcludeTaskComponent", () => {
  let component: ExcludeTaskComponent;
  let fixture: ComponentFixture<ExcludeTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcludeTaskComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcludeTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
