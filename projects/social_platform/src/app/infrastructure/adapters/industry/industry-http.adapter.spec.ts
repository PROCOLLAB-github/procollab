/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { IndustryHttpAdapter } from "./industry-http.adapter";

describe("IndustryHttpAdapter", () => {
  let adapter: IndustryHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get"]);
    TestBed.configureTestingModule({
      providers: [IndustryHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(IndustryHttpAdapter);
  }

  it("fetchAll идёт в GET /industries/", () => {
    setup();
    api.get.and.returnValue(of([]));

    adapter.fetchAll().subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/industries/");
  });
});
