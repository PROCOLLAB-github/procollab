/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AuthRepository } from "./auth.repository";
import { AuthHttpAdapter } from "../../adapters/auth/auth-http.adapter";
import { TokenService } from "@corelib";
import { User } from "@domain/auth/user.model";
import { LoginResponse, RegisterResponse } from "@core/lib/models/auth/http.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectDto } from "../../adapters/project/dto/project.dto";

describe("AuthRepository", () => {
  let repository: AuthRepository;
  let adapter: any;
  let tokenService: any;

  function setup(): void {
    adapter = {
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      downloadCV: vi.fn(),
      getProfile: vi.fn(),
      getUserRoles: vi.fn(),
      getLeaderProjects: vi.fn(),
      getChangeableRoles: vi.fn(),
      getUser: vi.fn(),
      saveAvatar: vi.fn(),
      saveProfile: vi.fn(),
      setOnboardingStage: vi.fn(),
      resetPassword: vi.fn(),
      setPassword: vi.fn(),
      resendEmail: vi.fn(),
    };
    tokenService = { clearTokens: vi.fn(), getTokens: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        AuthRepository,
        { provide: AuthHttpAdapter, useValue: adapter },
        { provide: TokenService, useValue: tokenService },
      ],
    });
    repository = TestBed.inject(AuthRepository);
  }

  it("login делегирует в adapter.login и мапит ответ в LoginResponse", () =>
    new Promise<void>(done => {
      setup();
      adapter.login.mockReturnValue(of({ access: "a", refresh: "r" } as LoginResponse));

      repository.login({ email: "e@e.ru", password: "p" }).subscribe(res => {
        expect(adapter.login).toHaveBeenCalledExactlyOnceWith({ email: "e@e.ru", password: "p" });
        expect(res).toBeInstanceOf(LoginResponse);
        done();
      });
    }));

  it("logout делегирует в adapter.logout и очищает токены", () =>
    new Promise<void>(done => {
      setup();
      adapter.logout.mockReturnValue(of(undefined));

      repository.logout().subscribe(() => {
        expect(adapter.logout).toHaveBeenCalledExactlyOnceWith();
        expect(tokenService.clearTokens).toHaveBeenCalledExactlyOnceWith();
        done();
      });
    }));

  it("register делегирует в adapter.register и мапит ответ в RegisterResponse", () =>
    new Promise<void>(done => {
      setup();
      adapter.register.mockReturnValue(of({} as RegisterResponse));
      const data = { email: "e@e.ru", password: "p" } as never;

      repository.register(data).subscribe(res => {
        expect(adapter.register).toHaveBeenCalledExactlyOnceWith(data);
        expect(res).toBeInstanceOf(RegisterResponse);
        done();
      });
    }));

  it("resendEmail мапит ответ в User", () =>
    new Promise<void>(done => {
      setup();
      adapter.resendEmail.mockReturnValue(of({ id: 1 } as User));

      repository.resendEmail("e@e.ru").subscribe(user => {
        expect(adapter.resendEmail).toHaveBeenCalledExactlyOnceWith("e@e.ru");
        expect(user).toBeInstanceOf(User);
        done();
      });
    }));

  it("fetchUser делегирует в adapter.getUser и мапит в User", () =>
    new Promise<void>(done => {
      setup();
      adapter.getUser.mockReturnValue(of({ id: 7 } as User));

      repository.fetchUser(7).subscribe(user => {
        expect(adapter.getUser).toHaveBeenCalledExactlyOnceWith(7);
        expect(user).toBeInstanceOf(User);
        done();
      });
    }));

  it("fetchProfile мапит ответ в User", () =>
    new Promise<void>(done => {
      setup();
      adapter.getProfile.mockReturnValue(of({ id: 1 } as User));

      repository.fetchProfile().subscribe(profile => {
        expect(profile).toBeInstanceOf(User);
        done();
      });
    }));

  it("updateProfile делегирует в adapter.saveProfile", () =>
    new Promise<void>(done => {
      setup();
      const data = { id: 1, firstName: "A" } as never;
      adapter.saveProfile.mockReturnValue(of({ id: 1, firstName: "A" } as User));

      repository.updateProfile(data).subscribe(profile => {
        expect(adapter.saveProfile).toHaveBeenCalledExactlyOnceWith(data);
        expect(profile).toBeInstanceOf(User);
        done();
      });
    }));

  it("updateOnboardingStage вызывает setOnboardingStage с переданным userId", () =>
    new Promise<void>(done => {
      setup();
      adapter.setOnboardingStage.mockReturnValue(
        of({ id: 9, onboardingStage: 3 } as unknown as User),
      );

      repository.updateOnboardingStage(3, 9).subscribe(() => {
        expect(adapter.setOnboardingStage).toHaveBeenCalledExactlyOnceWith(3, 9);
        done();
      });
    }));

  it("updateAvatar вызывает saveAvatar с переданным userId", () =>
    new Promise<void>(done => {
      setup();
      adapter.saveAvatar.mockReturnValue(of({ id: 9, avatar: "url" } as unknown as User));

      repository.updateAvatar("url", 9).subscribe(() => {
        expect(adapter.saveAvatar).toHaveBeenCalledExactlyOnceWith("url", 9);
        done();
      });
    }));

  it("fetchLeaderProjects мапит results в Project", () =>
    new Promise<void>(done => {
      setup();
      const page: ApiPagination<ProjectDto> = {
        count: 1,
        next: "",
        previous: "",
        results: [{ id: 1 } as ProjectDto],
      };
      adapter.getLeaderProjects.mockReturnValue(of(page));

      repository.fetchLeaderProjects().subscribe(res => {
        expect(res.results.length).toBe(1);
        done();
      });
    }));

  it("downloadCV делегирует в adapter.downloadCV", () => {
    setup();
    adapter.downloadCV.mockReturnValue(of(new Blob()));
    repository.downloadCV().subscribe();
    expect(adapter.downloadCV).toHaveBeenCalledExactlyOnceWith();
  });

  it("fetchUserRoles конвертирует [[id, name]] в UserRole[]", () =>
    new Promise<void>(done => {
      setup();
      adapter.getUserRoles.mockReturnValue(of([[1, "Админ"]]));

      repository.fetchUserRoles().subscribe(roles => {
        expect(roles.length).toBe(1);
        expect(roles[0].id).toBe(1);
        expect(roles[0].name).toBe("Админ");
        done();
      });
    }));

  it("fetchChangeableRoles конвертирует [[id, name]] в UserRole[]", () =>
    new Promise<void>(done => {
      setup();
      adapter.getChangeableRoles.mockReturnValue(of([[2, "Ментор"]]));

      repository.fetchChangeableRoles().subscribe(roles => {
        expect(roles.length).toBe(1);
        expect(roles[0].id).toBe(2);
        expect(roles[0].name).toBe("Ментор");
        done();
      });
    }));

  it("resetPassword делегирует в adapter.resetPassword", () => {
    setup();
    adapter.resetPassword.mockReturnValue(of(undefined));
    repository.resetPassword("e@e.ru").subscribe();
    expect(adapter.resetPassword).toHaveBeenCalledExactlyOnceWith("e@e.ru");
  });

  it("setPassword делегирует в adapter.setPassword", () => {
    setup();
    adapter.setPassword.mockReturnValue(of(undefined));
    repository.setPassword("p", "t").subscribe();
    expect(adapter.setPassword).toHaveBeenCalledExactlyOnceWith("p", "t");
  });
});
