/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InviteCardComponent } from "./invite-card.component";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";

describe("VacancyCardComponent", () => {
  let component: InviteCardComponent;
  let fixture: ComponentFixture<InviteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteCardComponent],
      providers: [
        provideNgxMask(),
        {
          provide: AuthRepositoryPort,
          useValue: {
            fetchProfile: () => of({}),
            fetchUserRoles: () => of([]),
            fetchChangeableRoles: () => of([]),
            fetchLeaderProjects: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("invite", { id: 1, user: { id: 1, firstName: "Test", lastName: "User", personal: { avatar: "" } } });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
