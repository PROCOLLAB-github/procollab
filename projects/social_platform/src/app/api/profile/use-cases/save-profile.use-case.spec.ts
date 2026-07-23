/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SaveProfileUseCase } from "./save-profile.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User, UserInput } from "@domain/auth/user.model";

describe("SaveProfileUseCase", () => {
  let useCase: SaveProfileUseCase;
  let repo: any;

  const command: UserInput = { firstName: "Иван" } as UserInput;
  const freshUser = { id: 42 } as User;

  function setup(): void {
    repo = { updateProfile: vi.fn(), fetchProfile: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SaveProfileUseCase, { provide: AuthRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SaveProfileUseCase);
  }

  it("делегирует command в updateProfile", () => {
    setup();
    repo.updateProfile.mockReturnValue(of(freshUser));

    useCase.execute(42, command).subscribe();

    expect(repo.updateProfile).toHaveBeenCalledExactlyOnceWith(42, command);
  });

  it("при успехе возвращает ok со профилем из updateProfile", () =>
    new Promise<void>(done => {
      setup();
      repo.updateProfile.mockReturnValue(of(freshUser));

      useCase.execute(42, command).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(freshUser);
        done();
      });
    }));

  it("при ошибке updateProfile возвращает fail { kind: 'profile_edit_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = { error: { phone_number: ["плохой номер"] } };
      repo.updateProfile.mockReturnValue(throwError(() => boom));

      useCase.execute(42, command).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("profile_edit_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
