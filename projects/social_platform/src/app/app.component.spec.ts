/** @format */

import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";
import { TokenService } from "@corelib";
import { LoadingService } from "@api/shared/loading.service";

describe("AppComponent", () => {
  beforeEach(async () => {
    const authPortSpy = {
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const tokenSpy = { getTokens: jasmine.createSpy("getTokens").and.returnValue(null) };
    const loadingSpy = {
      show: jasmine.createSpy("show"),
      hide: jasmine.createSpy("hide"),
      isLoading$: of(false),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: TokenService, useValue: tokenSpy },
        { provide: LoadingService, useValue: loadingSpy },
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
