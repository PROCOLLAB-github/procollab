/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MemberCardComponent } from "./member-card.component";
import { User } from "@auth/models/user.model";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { DayjsPipe, YearsFromBirthdayPipe } from "projects/core";

describe("MemberCardComponent", () => {
  let component: MemberCardComponent;
  let fixture: ComponentFixture<MemberCardComponent>;

  beforeEach(async () => {
    const authSpy = {
      roles: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [MemberCardComponent, UserRolePipe, DayjsPipe, YearsFromBirthdayPipe],
      providers: [{ provide: AuthService, useValue: authSpy }],
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
