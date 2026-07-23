/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateProfileUseCase } from "./update-profile.use-case";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User, UserInput } from "@domain/auth/user.model";

describe("UpdateProfileUseCase", () => {
  let useCase: UpdateProfileUseCase;
  let repository: { updateProfile: ReturnType<typeof vi.fn> };

  const data = { city: "Москва" } as UserInput;
  const updatedProfile = { id: 42 } as User;

  beforeEach(() => {
    repository = { updateProfile: vi.fn() };
    TestBed.configureTestingModule({
      providers: [UpdateProfileUseCase, { provide: AuthRepositoryPort, useValue: repository }],
    });
    useCase = TestBed.inject(UpdateProfileUseCase);
  });

  it("передает profileId и данные в репозиторий отдельными аргументами", () => {
    repository.updateProfile.mockReturnValue(of(updatedProfile));

    useCase.execute(42, data).subscribe();

    expect(repository.updateProfile).toHaveBeenCalledExactlyOnceWith(42, data);
  });

  it("сохраняет успешный Result-контракт", () =>
    new Promise<void>(done => {
      repository.updateProfile.mockReturnValue(of(updatedProfile));

      useCase.execute(42, data).subscribe(result => {
        expect(result).toEqual({ ok: true, value: updatedProfile });
        done();
      });
    }));

  it("сохраняет server_error Result-контракт при ошибке", () =>
    new Promise<void>(done => {
      const cause = new Error("request failed");
      repository.updateProfile.mockReturnValue(throwError(() => cause));

      useCase.execute(42, data).subscribe(result => {
        expect(result).toEqual({ ok: false, error: { kind: "server_error", cause } });
        done();
      });
    }));
});
