/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramDetailMainComponent } from "./main.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MainComponent", () => {
  let component: ProgramDetailMainComponent;
  let fixture: ComponentFixture<ProgramDetailMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
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
