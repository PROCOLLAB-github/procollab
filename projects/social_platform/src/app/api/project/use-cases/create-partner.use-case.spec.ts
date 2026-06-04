/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { CreatePartnerUseCase } from "./create-partner.use-case";
import { ProjectPartnerRepositoryPort } from "@domain/project/ports/project-partner.repository.port";
import { Partner, PartnerDto } from "@domain/project/partner.model";

describe("CreatePartnerUseCase", () => {
  let useCase: CreatePartnerUseCase;
  let repo: any;

  function setup(): void {
    repo = { createPartner: vi.fn() };
    TestBed.configureTestingModule({
      providers: [CreatePartnerUseCase, { provide: ProjectPartnerRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(CreatePartnerUseCase);
  }

  it("делегирует (projectId, partner) в createPartner", () => {
    setup();
    repo.createPartner.mockReturnValue(of({} as Partner));
    const dto = {} as PartnerDto;

    useCase.execute(1, dto).subscribe();

    expect(repo.createPartner).toHaveBeenCalledExactlyOnceWith(1, dto);
  });

  it("при успехе возвращает ok с партнёром", () =>
    new Promise<void>(done => {
      setup();
      const partner = {} as Partner;
      repo.createPartner.mockReturnValue(of(partner));

      useCase.execute(1, {} as PartnerDto).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(partner);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'create_project_partner_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.createPartner.mockReturnValue(throwError(() => err));

      useCase.execute(1, {} as PartnerDto).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("create_project_partner_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
