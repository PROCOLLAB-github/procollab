/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InviteCardComponent } from "./invite-card.component";

describe("VacancyCardComponent", () => {
  let component: InviteCardComponent;
  let fixture: ComponentFixture<InviteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InviteCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
