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
      login: jasmine.createSpy("login").and.returnValue(of({} as any)),
      logout: jasmine.createSpy("logout").and.returnValue(of(undefined)),
      fetchProfile: jasmine.createSpy("fetchProfile").and.returnValue(of({ id: 1, firstName: "Test" })),
      fetchUser: jasmine.createSpy("fetchUser").and.returnValue(of({} as any)),
      fetchUserRoles: jasmine.createSpy("fetchUserRoles").and.returnValue(of([])),
      fetchChangeableRoles: jasmine.createSpy("fetchChangeableRoles").and.returnValue(of([])),
      fetchLeaderProjects: jasmine.createSpy("fetchLeaderProjects").and.returnValue(of({} as any)),
    };

    await TestBed.configureTestingModule({
      imports: [ResponseCardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthRepositoryPort, useValue: authPortSpy },
      ],
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
