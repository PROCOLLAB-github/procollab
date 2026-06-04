/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResponseCardComponent } from "./response-card.component";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";

describe("ResponseCardComponent", () => {
  let component: ResponseCardComponent;
  let fixture: ComponentFixture<ResponseCardComponent>;

  beforeEach(async () => {
    const authPortSpy = {
      login: vi.fn().mockReturnValue(of({} as any)),
      logout: vi.fn().mockReturnValue(of(undefined)),
      fetchProfile: vi.fn().mockReturnValue(of({ id: 1, firstName: "Test" })),
      fetchUser: vi.fn().mockReturnValue(of({} as any)),
      fetchUserRoles: vi.fn().mockReturnValue(of([])),
      fetchChangeableRoles: vi.fn().mockReturnValue(of([])),
      fetchLeaderProjects: vi.fn().mockReturnValue(of({} as any)),
    };

    await TestBed.configureTestingModule({
      imports: [ResponseCardComponent],
      providers: [provideRouter([]), { provide: AuthRepositoryPort, useValue: authPortSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("response", {
      id: 1,
      user: { id: 1, firstName: "Test", lastName: "User" },
      status: "pending",
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
