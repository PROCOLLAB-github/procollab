/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProgramCardComponent } from "./program-card.component";

describe("ProgramCardComponent", () => {
  let component: ProgramCardComponent;
  let fixture: ComponentFixture<ProgramCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("program", {
      id: 1,
      name: "Test Program",
      datetimeRegistrationEnds: new Date(Date.now() + 86400000).toISOString(),
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
