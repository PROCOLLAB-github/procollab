/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AuthRepository } from "./auth.repository";
import { AuthHttpAdapter } from "../../adapters/auth/auth-http.adapter";
import { TokenService } from "@corelib";
import { User } from "@domain/auth/user.model";
import { LoginResponse, RegisterResponse } from "@domain/auth/http.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectDto } from "../../adapters/project/dto/project.dto";

describe("AuthRepository", () => {
  let repository: AuthRepository;
  let adapter: jasmine.SpyObj<AuthHttpAdapter>;
  let tokenService: jasmine.SpyObj<TokenService>;

  function setup(): void {
    adapter = jasmine.createSpyObj<AuthHttpAdapter>("AuthHttpAdapter", [
      "login",
      "logout",
      "register",
      "downloadCV",
      "getProfile",
      "getUserRoles",
      "getLeaderProjects",
      "getChangeableRoles",
      "getUser",
      "saveAvatar",
      "saveProfile",
      "setOnboardingStage",
      "resetPassword",
      "setPassword",
      "resendEmail",
    ]);
    tokenService = jasmine.createSpyObj<TokenService>("TokenService", ["clearTokens", "getTokens"]);
    TestBed.configureTestingModule({
      providers: [
        AuthRepository,
        { provide: AuthHttpAdapter, useValue: adapter },
        { provide: TokenService, useValue: tokenService },
      ],
    });
    repository = TestBed.inject(AuthRepository);
  }

  it("login делегирует в adapter.login и мапит ответ в LoginResponse", done => {
    setup();
    adapter.login.and.returnValue(of({ access: "a", refresh: "r" } as LoginResponse));

    repository.login({ email: "e@e.ru", password: "p" }).subscribe(res => {
      expect(adapter.login).toHaveBeenCalledOnceWith({ email: "e@e.ru", password: "p" });
      expect(res).toBeInstanceOf(LoginResponse);
      done();
    });
  });

  it("logout делегирует в adapter.logout и очищает токены", done => {
    setup();
    adapter.logout.and.returnValue(of(undefined));

    repository.logout().subscribe(() => {
      expect(adapter.logout).toHaveBeenCalledOnceWith();
      expect(tokenService.clearTokens).toHaveBeenCalledOnceWith();
      done();
    });
  });

  it("register делегирует в adapter.register и мапит ответ в RegisterResponse", done => {
    setup();
    adapter.register.and.returnValue(of({} as RegisterResponse));
    const data = { email: "e@e.ru", password: "p" } as never;

    repository.register(data).subscribe(res => {
      expect(adapter.register).toHaveBeenCalledOnceWith(data);
      expect(res).toBeInstanceOf(RegisterResponse);
      done();
    });
  });

  it("resendEmail мапит ответ в User", done => {
    setup();
    adapter.resendEmail.and.returnValue(of({ id: 1 } as User));

    repository.resendEmail("e@e.ru").subscribe(user => {
      expect(adapter.resendEmail).toHaveBeenCalledOnceWith("e@e.ru");
      expect(user).toBeInstanceOf(User);
      done();
    });
  });

  it("fetchUser делегирует в adapter.getUser и мапит в User", done => {
    setup();
    adapter.getUser.and.returnValue(of({ id: 7 } as User));

    repository.fetchUser(7).subscribe(user => {
      expect(adapter.getUser).toHaveBeenCalledOnceWith(7);
      expect(user).toBeInstanceOf(User);
      done();
    });
  });

  it("fetchProfile мапит в User и пушит в profile$", done => {
    setup();
    adapter.getProfile.and.returnValue(of({ id: 1 } as User));

    repository.fetchProfile().subscribe();

    repository.profile.subscribe(profile => {
      expect(profile).toBeInstanceOf(User);
      done();
    });
  });

  it("updateProfile делегирует в adapter.saveProfile и пушит в profile$", done => {
    setup();
    const updated = { id: 1, firstName: "A" } as User;
    adapter.saveProfile.and.returnValue(of(updated));

    repository.updateProfile({ firstName: "A" }).subscribe();

    repository.profile.subscribe(profile => {
      expect(profile).toBe(updated);
      expect(adapter.saveProfile).toHaveBeenCalledOnceWith({ firstName: "A" });
      done();
    });
  });

  it("updateOnboardingStage вызывает setOnboardingStage с id текущего профиля", done => {
    setup();
    adapter.getProfile.and.returnValue(of({ id: 9 } as User));
    adapter.setOnboardingStage.and.returnValue(of({ id: 9, onboardingStage: 3 } as User));
    repository.fetchProfile().subscribe();

    repository.updateOnboardingStage(3).subscribe(() => {
      expect(adapter.setOnboardingStage).toHaveBeenCalledOnceWith(3, 9);
      done();
    });
  });

  it("updateAvatar вызывает saveAvatar с id текущего профиля", done => {
    setup();
    adapter.getProfile.and.returnValue(of({ id: 9 } as User));
    adapter.saveAvatar.and.returnValue(of({ id: 9, avatar: "url" } as User));
    repository.fetchProfile().subscribe();

    repository.updateAvatar("url").subscribe(() => {
      expect(adapter.saveAvatar).toHaveBeenCalledOnceWith("url", 9);
      done();
    });
  });

  it("fetchLeaderProjects мапит results в Project", done => {
    setup();
    const page: ApiPagination<ProjectDto> = {
      count: 1,
      next: "",
      previous: "",
      results: [{ id: 1 } as ProjectDto],
    };
    adapter.getLeaderProjects.and.returnValue(of(page));

    repository.fetchLeaderProjects().subscribe(res => {
      expect(res.results.length).toBe(1);
      done();
    });
  });

  it("downloadCV делегирует в adapter.downloadCV", () => {
    setup();
    adapter.downloadCV.and.returnValue(of(new Blob()));
    repository.downloadCV().subscribe();
    expect(adapter.downloadCV).toHaveBeenCalledOnceWith();
  });

  it("fetchUserRoles конвертирует [[id, name]] в UserRole[] и пушит в roles$", done => {
    setup();
    adapter.getUserRoles.and.returnValue(of([[1, "Админ"]]));

    repository.fetchUserRoles().subscribe();
    repository.roles.subscribe(roles => {
      expect(roles.length).toBe(1);
      expect(roles[0].id).toBe(1);
      expect(roles[0].name).toBe("Админ");
      done();
    });
  });

  it("fetchChangeableRoles конвертирует [[id, name]] и пушит в changeableRoles$", done => {
    setup();
    adapter.getChangeableRoles.and.returnValue(of([[2, "Ментор"]]));

    repository.fetchChangeableRoles().subscribe();
    repository.changeableRoles.subscribe(roles => {
      expect(roles.length).toBe(1);
      expect(roles[0].id).toBe(2);
      expect(roles[0].name).toBe("Ментор");
      done();
    });
  });

  it("resetPassword делегирует в adapter.resetPassword", () => {
    setup();
    adapter.resetPassword.and.returnValue(of(undefined));
    repository.resetPassword("e@e.ru").subscribe();
    expect(adapter.resetPassword).toHaveBeenCalledOnceWith("e@e.ru");
  });

  it("setPassword делегирует в adapter.setPassword", () => {
    setup();
    adapter.setPassword.and.returnValue(of(undefined));
    repository.setPassword("p", "t").subscribe();
    expect(adapter.setPassword).toHaveBeenCalledOnceWith("p", "t");
  });
});
