/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SpecializationsGroupComponent } from "./specializations-group.component";

describe("SpecializationsGroupComponent", () => {
  let component: SpecializationsGroupComponent;
  let fixture: ComponentFixture<SpecializationsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecializationsGroupComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecializationsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
