/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SaveProfileUseCase } from "./save-profile.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User, UserInput } from "@domain/auth/user.model";

describe("SaveProfileUseCase", () => {
  let useCase: SaveProfileUseCase;
  let repo: jasmine.SpyObj<AuthRepositoryPort>;

  const command: UserInput = { firstName: "Иван" } as UserInput;
  const freshUser = { id: 42 } as User;

  function setup(): void {
    repo = jasmine.createSpyObj<AuthRepositoryPort>("AuthRepositoryPort", [
      "updateProfile",
      "fetchProfile",
    ]);
    TestBed.configureTestingModule({
      providers: [SaveProfileUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SaveProfileUseCase);
  }

  it("делегирует command в updateProfile, затем дочитывает профиль через fetchProfile", () => {
    setup();
    repo.updateProfile.and.returnValue(of({} as User));
    repo.fetchProfile.and.returnValue(of(freshUser));

    useCase.execute(command).subscribe();

    expect(repo.updateProfile).toHaveBeenCalledOnceWith(command);
    expect(repo.fetchProfile).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok со свежим профилем из fetchProfile", done => {
    setup();
    repo.updateProfile.and.returnValue(of({} as User));
    repo.fetchProfile.and.returnValue(of(freshUser));

    useCase.execute(command).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(freshUser);
      done();
    });
  });

  it("при ошибке updateProfile возвращает fail { kind: 'profile_edit_error' } с cause и не зовёт fetchProfile", done => {
    setup();
    const boom = { error: { phone_number: ["плохой номер"] } };
    repo.updateProfile.and.returnValue(throwError(() => boom));

    useCase.execute(command).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("profile_edit_error");
        expect(result.error.cause).toBe(boom);
      }
      expect(repo.fetchProfile).not.toHaveBeenCalled();
      done();
    });
  });

  it("при ошибке fetchProfile возвращает fail { kind: 'profile_edit_error' }", done => {
    setup();
    repo.updateProfile.and.returnValue(of({} as User));
    repo.fetchProfile.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(command).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("profile_edit_error");
      done();
    });
  });
});
