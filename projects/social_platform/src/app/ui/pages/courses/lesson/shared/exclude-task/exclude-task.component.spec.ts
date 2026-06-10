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
    fixture.componentRef.setInput("data", {
      id: 1,
      text: "Test",
      options: [],
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
