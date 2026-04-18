/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectPartnerRepository } from "./project-partner.repository";
import { ProjectPartnerHttpAdapter } from "../../adapters/project/project-partner-http.adapter";
import { Partner, PartnerDto } from "@domain/project/partner.model";

describe("ProjectPartnerRepository", () => {
  let repository: ProjectPartnerRepository;
  let adapter: jasmine.SpyObj<ProjectPartnerHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProjectPartnerHttpAdapter>("ProjectPartnerHttpAdapter", [
      "addPartner",
      "getPartners",
      "editParter",
      "deletePartner",
    ]);
    TestBed.configureTestingModule({
      providers: [
        ProjectPartnerRepository,
        { provide: ProjectPartnerHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectPartnerRepository);
  }

  it("createPartner мапит ответ в Partner", done => {
    setup();
    const params = {} as PartnerDto;
    adapter.addPartner.and.returnValue(of({ id: 1 } as Partner));

    repository.createPartner(42, params).subscribe(p => {
      expect(adapter.addPartner).toHaveBeenCalledOnceWith(42, params);
      expect(p).toBeInstanceOf(Partner);
      done();
    });
  });

  it("fetchAll мапит ответ в Partner[]", done => {
    setup();
    adapter.getPartners.and.returnValue(of([{ id: 1 }] as Partner[]));

    repository.fetchAll(42).subscribe(partners => {
      expect(adapter.getPartners).toHaveBeenCalledOnceWith(42);
      expect(partners[0]).toBeInstanceOf(Partner);
      done();
    });
  });

  it("updatePartner мапит ответ в Partner[]", done => {
    setup();
    adapter.editParter.and.returnValue(of([{ id: 1 }] as Partner[]));

    repository.updatePartner(42, 7, { contribution: "c", decisionMaker: 1 }).subscribe(ps => {
      expect(adapter.editParter).toHaveBeenCalledOnceWith(42, 7, {
        contribution: "c",
        decisionMaker: 1,
      });
      expect(ps[0]).toBeInstanceOf(Partner);
      done();
    });
  });

  it("deletePartner делегирует в adapter", () => {
    setup();
    adapter.deletePartner.and.returnValue(of(undefined));
    repository.deletePartner(42, 7).subscribe();
    expect(adapter.deletePartner).toHaveBeenCalledOnceWith(42, 7);
  });
});
