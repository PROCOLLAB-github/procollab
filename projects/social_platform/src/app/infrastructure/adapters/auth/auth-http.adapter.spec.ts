/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService, TokenService } from "@corelib";
import { AuthHttpAdapter } from "./auth-http.adapter";
import { User } from "@domain/auth/user.model";
import { LoginResponse, RegisterResponse } from "@core/lib/models/auth/http.model";

describe("AuthHttpAdapter", () => {
  let adapter: AuthHttpAdapter;
  let api: any;
  let tokens: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), getFile: vi.fn() };
    tokens = { getTokens: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        AuthHttpAdapter,
        { provide: ApiService, useValue: api },
        { provide: TokenService, useValue: tokens },
      ],
    });
    adapter = TestBed.inject(AuthHttpAdapter);
  }

  it("login идёт в POST /api/token/ с email/password", () => {
    setup();
    api.post.mockReturnValue(of({} as LoginResponse));

    adapter.login({ email: "u@e.com", password: "p" }).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/api/token/", {
      email: "u@e.com",
      password: "p",
    });
  });

  it("logout идёт в POST /auth/logout/ с refreshToken из TokenService", () => {
    setup();
    tokens.getTokens.mockReturnValue({ access: "a", refresh: "r" });
    api.post.mockReturnValue(of(undefined));

    adapter.logout().subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/logout/", { refreshToken: "r" });
  });

  it("register идёт в POST /auth/users/", () => {
    setup();
    api.post.mockReturnValue(of({} as RegisterResponse));
    const data = { email: "e", password: "p" } as unknown as Parameters<typeof adapter.register>[0];

    adapter.register(data).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/users/", data);
  });

  it("downloadCV идёт в getFile /auth/users/download_cv/", () => {
    setup();
    api.getFile.mockReturnValue(of(new Blob()));

    adapter.downloadCV().subscribe();

    expect(api.getFile).toHaveBeenCalledExactlyOnceWith("/auth/users/download_cv/");
  });

  it("getProfile идёт в GET /auth/users/current/", () => {
    setup();
    api.get.mockReturnValue(of({} as User));

    adapter.getProfile().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/current/");
  });

  it("getUserRoles идёт в GET /auth/users/types/", () => {
    setup();
    api.get.mockReturnValue(of([[1, "r"]] as [[number, string]]));

    adapter.getUserRoles().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/types/");
  });

  it("getLeaderProjects идёт в GET /auth/users/projects/leader/", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.getLeaderProjects().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/projects/leader/");
  });

  it("getChangeableRoles идёт в GET /auth/users/roles/", () => {
    setup();
    api.get.mockReturnValue(of([[1, "r"]] as [[number, string]]));

    adapter.getChangeableRoles().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/roles/");
  });

  it("getUser идёт в GET /auth/users/:id/", () => {
    setup();
    api.get.mockReturnValue(of({} as User));

    adapter.getUser(7).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/7/");
  });

  it("saveAvatar идёт в PATCH /auth/users/:pid с avatar", () => {
    setup();
    api.patch.mockReturnValue(of({} as User));

    adapter.saveAvatar("https://x/a.png", 7).subscribe();

    expect(api.patch).toHaveBeenCalledExactlyOnceWith("/auth/users/7/", {
      avatar: "https://x/a.png",
    });
  });

  it("saveProfile идёт в PATCH /auth/users/:id/ с частичными данными", () => {
    setup();
    api.patch.mockReturnValue(of({} as User));
    const profile: Partial<User> = { id: 7, firstName: "A" };

    adapter.saveProfile(profile).subscribe();

    expect(api.patch).toHaveBeenCalledExactlyOnceWith("/auth/users/7/", profile);
  });

  it("setOnboardingStage идёт в PUT /auth/users/:pid/set_onboarding_stage/", () => {
    setup();
    api.put.mockReturnValue(of({} as User));

    adapter.setOnboardingStage(2, 7).subscribe();

    expect(api.put).toHaveBeenCalledExactlyOnceWith("/auth/users/7/set_onboarding_stage/", {
      onboardingStage: 2,
    });
  });

  it("resetPassword идёт в POST /auth/reset_password/ c email", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.resetPassword("u@e.com").subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/reset_password/", { email: "u@e.com" });
  });

  it("setPassword идёт в POST /auth/reset_password/confirm/ c password/token", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.setPassword("newpass", "tok").subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/reset_password/confirm/", {
      password: "newpass",
      token: "tok",
    });
  });

  it("resendEmail идёт в POST /auth/resend_email/ c email", () => {
    setup();
    api.post.mockReturnValue(of({} as User));

    adapter.resendEmail("u@e.com").subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/resend_email/", { email: "u@e.com" });
  });
});
