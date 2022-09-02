/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MemberCardComponent } from "./member-card.component";
import { User } from "../../../auth/models/user.model";

describe("MemberCardComponent", () => {
  let component: MemberCardComponent;
  let fixture: ComponentFixture<MemberCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemberCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberCardComponent);

    component = fixture.componentInstance;
    component.user = User.default();

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
