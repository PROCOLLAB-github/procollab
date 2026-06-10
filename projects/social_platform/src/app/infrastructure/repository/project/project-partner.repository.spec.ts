/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectPartnerRepository } from "./project-partner.repository";
import { ProjectPartnerHttpAdapter } from "../../adapters/project/project-partner-http.adapter";
import { Partner, PartnerDto } from "@domain/project/partner.model";

describe("ProjectPartnerRepository", () => {
  let repository: ProjectPartnerRepository;
  let adapter: any;

  function setup(): void {
    adapter = {
      addPartner: vi.fn(),
      getPartners: vi.fn(),
      editParter: vi.fn(),
      deletePartner: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        ProjectPartnerRepository,
        { provide: ProjectPartnerHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectPartnerRepository);
  }

  it("createPartner мапит ответ в Partner", () =>
    new Promise<void>(done => {
      setup();
      const params = {} as PartnerDto;
      adapter.addPartner.mockReturnValue(of({ id: 1 } as Partner));

      repository.createPartner(42, params).subscribe(p => {
        expect(adapter.addPartner).toHaveBeenCalledExactlyOnceWith(42, params);
        expect(p).toBeInstanceOf(Partner);
        done();
      });
    }));

  it("fetchAll мапит ответ в Partner[]", () =>
    new Promise<void>(done => {
      setup();
      adapter.getPartners.mockReturnValue(of([{ id: 1 }] as Partner[]));

      repository.fetchAll(42).subscribe(partners => {
        expect(adapter.getPartners).toHaveBeenCalledExactlyOnceWith(42);
        expect(partners[0]).toBeInstanceOf(Partner);
        done();
      });
    }));

  it("updatePartner мапит ответ в Partner[]", () =>
    new Promise<void>(done => {
      setup();
      adapter.editParter.mockReturnValue(of([{ id: 1 }] as Partner[]));

      repository.updatePartner(42, 7, { contribution: "c", decisionMaker: 1 }).subscribe(ps => {
        expect(adapter.editParter).toHaveBeenCalledExactlyOnceWith(42, 7, {
          contribution: "c",
          decisionMaker: 1,
        });
        expect(ps[0]).toBeInstanceOf(Partner);
        done();
      });
    }));

  it("deletePartner делегирует в adapter", () => {
    setup();
    adapter.deletePartner.mockReturnValue(of(undefined));
    repository.deletePartner(42, 7).subscribe();
    expect(adapter.deletePartner).toHaveBeenCalledExactlyOnceWith(42, 7);
  });
});
