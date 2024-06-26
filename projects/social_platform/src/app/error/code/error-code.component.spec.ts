/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ErrorCodeComponent } from "./error-code.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("ErrorCodeComponent", () => {
  let component: ErrorCodeComponent;
  let fixture: ComponentFixture<ErrorCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ErrorCodeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
