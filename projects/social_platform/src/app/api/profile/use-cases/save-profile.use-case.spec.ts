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

  it("делегирует command в updateProfile", () => {
    setup();
    repo.updateProfile.and.returnValue(of(freshUser));

    useCase.execute(command).subscribe();

    expect(repo.updateProfile).toHaveBeenCalledOnceWith(command);
  });

  it("при успехе возвращает ok со профилем из updateProfile", done => {
    setup();
    repo.updateProfile.and.returnValue(of(freshUser));

    useCase.execute(command).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(freshUser);
      done();
    });
  });

  it("при ошибке updateProfile возвращает fail { kind: 'profile_edit_error' } с cause", done => {
    setup();
    const boom = { error: { phone_number: ["плохой номер"] } };
    repo.updateProfile.and.returnValue(throwError(() => boom));

    useCase.execute(command).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("profile_edit_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
