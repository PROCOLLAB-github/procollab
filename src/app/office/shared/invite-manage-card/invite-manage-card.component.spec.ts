/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InviteManageCardComponent } from "./invite-manage-card.component";

describe("InviteManageCardComponent", () => {
  let component: InviteManageCardComponent;
  let fixture: ComponentFixture<InviteManageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InviteManageCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteManageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
