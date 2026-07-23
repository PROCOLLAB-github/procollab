/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User, UserInput } from "@domain/auth/user.model";
import { UpdateProfileUseCase } from "./update-profile.use-case";

describe("UpdateProfileUseCase", () => {
  let useCase: UpdateProfileUseCase;
  let repository: { updateProfile: ReturnType<typeof vi.fn> };

  const data: UserInput = { city: "Москва" };
  const updatedProfile = { id: 42 } as User;

  beforeEach(() => {
    repository = { updateProfile: vi.fn() };
    TestBed.configureTestingModule({
      providers: [UpdateProfileUseCase, { provide: AuthRepositoryPort, useValue: repository }],
    });
    useCase = TestBed.inject(UpdateProfileUseCase);
  });

  it("передает profileId и данные в repository", () => {
    repository.updateProfile.mockReturnValue(of(updatedProfile));

    useCase.execute(42, data).subscribe();

    expect(repository.updateProfile).toHaveBeenCalledExactlyOnceWith(42, data);
  });

  it("сохраняет успешный Result-контракт", () =>
    new Promise<void>(done => {
      repository.updateProfile.mockReturnValue(of(updatedProfile));

      useCase.execute(42, data).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(updatedProfile);
        done();
      });
    }));

  it("преобразует ошибку repository в server_error", () =>
    new Promise<void>(done => {
      const cause = new Error("server failed");
      repository.updateProfile.mockReturnValue(throwError(() => cause));

      useCase.execute(42, data).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("server_error");
          expect(result.error.cause).toBe(cause);
        }
        done();
      });
    }));
});
