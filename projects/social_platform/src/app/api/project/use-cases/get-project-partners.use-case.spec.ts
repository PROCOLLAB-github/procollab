/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectPartnersUseCase } from "./get-project-partners.use-case";
import { ProjectPartnerRepositoryPort } from "@domain/project/ports/project-partner.repository.port";
import { Partner } from "@domain/project/partner.model";

describe("GetProjectPartnersUseCase", () => {
  let useCase: GetProjectPartnersUseCase;
  let repo: jasmine.SpyObj<ProjectPartnerRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectPartnerRepositoryPort>("ProjectPartnerRepositoryPort", [
      "fetchAll",
    ]);
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
    repo.fetchAll.and.returnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.fetchAll).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok с массивом партнёров", done => {
    setup();
    const partners: Partner[] = [];
    repo.fetchAll.and.returnValue(of(partners));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(partners);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_partners_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.fetchAll.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_partners_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
