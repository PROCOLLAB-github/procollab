/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UserTypeCardComponent } from "./user-type-card.component";

describe("UserTypeCardComponent", () => {
  let component: UserTypeCardComponent;
  let fixture: ComponentFixture<UserTypeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTypeCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
