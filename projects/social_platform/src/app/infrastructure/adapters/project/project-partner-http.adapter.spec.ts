/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectPartnerHttpAdapter } from "./project-partner-http.adapter";
import { Partner, PartnerDto } from "@domain/project/partner.model";

describe("ProjectPartnerHttpAdapter", () => {
  let adapter: ProjectPartnerHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post", "patch", "delete"]);
    TestBed.configureTestingModule({
      providers: [ProjectPartnerHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectPartnerHttpAdapter);
  }

  it("addPartner идёт в POST /projects/:id/companies/ c params", () => {
    setup();
    api.post.and.returnValue(of({} as Partner));
    const params = {} as PartnerDto;

    adapter.addPartner(42, params).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/companies/", params);
  });

  it("getPartners идёт в GET /projects/:id/companies/list/", () => {
    setup();
    api.get.and.returnValue(of([] as Partner[]));

    adapter.getPartners(42).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/42/companies/list/");
  });

  it("editParter идёт в PATCH /projects/:pid/companies/:cid/ c partial", () => {
    setup();
    api.patch.and.returnValue(of([] as Partner[]));
    const params = {} as Pick<PartnerDto, "contribution" | "decisionMaker">;

    adapter.editParter(42, 7, params).subscribe();

    expect(api.patch).toHaveBeenCalledOnceWith("/projects/42/companies/7/", params);
  });

  it("deletePartner идёт в DELETE /projects/:pid/companies/:cid/", () => {
    setup();
    api.delete.and.returnValue(of(undefined));

    adapter.deletePartner(42, 7).subscribe();

    expect(api.delete).toHaveBeenCalledOnceWith("/projects/42/companies/7/");
  });
});
