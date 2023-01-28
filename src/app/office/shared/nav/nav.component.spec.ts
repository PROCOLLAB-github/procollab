/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NavComponent } from "./nav.component";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthService } from "../../../auth/services";
import { InviteService } from "../../services/invite.service";

describe("NavComponent", () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    const inviteSpy = jasmine.createSpyObj({ acceptInvite: of({}), rejectInvite: of({}) });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: InviteService, useValue: inviteSpy },
      ],
      declarations: [NavComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
