/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { InviteManageCardComponent } from "./invite-manage-card.component";

describe("InviteManageCardComponent", () => {
  let component: InviteManageCardComponent;
  let fixture: ComponentFixture<InviteManageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteManageCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteManageCardComponent);
    component = fixture.componentInstance;
    // invite — required input; шаблон читает sender.{id,firstName,lastName,personal.avatar} и project.{id,name}
    fixture.componentRef.setInput("invite", {
      id: 1,
      sender: { id: 2, firstName: "Иван", lastName: "Петров", personal: { avatar: "" } },
      project: { id: 3, name: "Проект" },
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
