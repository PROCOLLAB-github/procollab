/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectPartnersUseCase } from "./get-project-partners.use-case";
import { ProjectPartnerRepositoryPort } from "@domain/project/ports/project-partner.repository.port";
import { Partner } from "@domain/project/partner.model";

describe("GetProjectPartnersUseCase", () => {
  let useCase: GetProjectPartnersUseCase;
  let repo: any;

  function setup(): void {
    repo = { fetchAll: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        GetProjectPartnersUseCase,
        { provide: ProjectPartnerRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProjectPartnersUseCase);
  }

  it("делегирует projectId в fetchAll", () => {
    setup();
    repo.fetchAll.mockReturnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.fetchAll).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с массивом партнёров", () =>
    new Promise<void>(done => {
      setup();
      const partners: Partner[] = [];
      repo.fetchAll.mockReturnValue(of(partners));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(partners);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_partners_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.fetchAll.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_partners_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
