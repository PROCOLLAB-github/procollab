/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeletePartnerUseCase } from "./delete-partner.use-case";
import { ProjectPartnerRepositoryPort } from "@domain/project/ports/project-partner.repository.port";

describe("DeletePartnerUseCase", () => {
  let useCase: DeletePartnerUseCase;
  let repo: any;

  function setup(): void {
    repo = { deletePartner: vi.fn() };
    TestBed.configureTestingModule({
      providers: [DeletePartnerUseCase, { provide: ProjectPartnerRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DeletePartnerUseCase);
  }

  it("делегирует (projectId, partnerId) в deletePartner", () => {
    setup();
    repo.deletePartner.mockReturnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deletePartner).toHaveBeenCalledExactlyOnceWith(1, 42);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.deletePartner.mockReturnValue(of(undefined));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'delete_project_partner_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.deletePartner.mockReturnValue(throwError(() => err));

      useCase.execute(1, 42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("delete_project_partner_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
