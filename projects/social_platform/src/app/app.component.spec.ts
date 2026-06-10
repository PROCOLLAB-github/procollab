/** @format */

import { TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";
import { TokenService } from "@corelib";
import { LoadingService } from "@api/shared/loading.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("AppComponent", () => {
  beforeEach(async () => {
    const authPortSpy = {
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const tokenSpy = { getTokens: vi.fn().mockReturnValue(null) };
    const loadingSpy = {
      show: vi.fn(),
      hide: vi.fn(),
      isLoading$: of(false),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
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
