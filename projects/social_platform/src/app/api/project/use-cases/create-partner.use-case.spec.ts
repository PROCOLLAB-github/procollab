/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CreatePartnerUseCase } from "./create-partner.use-case";
import { ProjectPartnerRepositoryPort } from "@domain/project/ports/project-partner.repository.port";
import { Partner, PartnerDto } from "@domain/project/partner.model";

describe("CreatePartnerUseCase", () => {
  let useCase: CreatePartnerUseCase;
  let repo: jasmine.SpyObj<ProjectPartnerRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectPartnerRepositoryPort>("ProjectPartnerRepositoryPort", [
      "createPartner",
    ]);
    TestBed.configureTestingModule({
      providers: [CreatePartnerUseCase, { provide: ProjectPartnerRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(CreatePartnerUseCase);
  }

  it("делегирует (projectId, partner) в createPartner", () => {
    setup();
    repo.createPartner.and.returnValue(of({} as Partner));
    const dto = {} as PartnerDto;

    useCase.execute(1, dto).subscribe();

    expect(repo.createPartner).toHaveBeenCalledOnceWith(1, dto);
  });

  it("при успехе возвращает ok с партнёром", done => {
    setup();
    const partner = {} as Partner;
    repo.createPartner.and.returnValue(of(partner));

    useCase.execute(1, {} as PartnerDto).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(partner);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'create_project_partner_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.createPartner.and.returnValue(throwError(() => err));

    useCase.execute(1, {} as PartnerDto).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("create_project_partner_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
