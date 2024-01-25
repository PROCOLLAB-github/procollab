/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewProjectComponent } from "./new-project.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("NewProjectComponent", () => {
  let component: NewProjectComponent;
  let fixture: ComponentFixture<NewProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProjectComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NewProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
