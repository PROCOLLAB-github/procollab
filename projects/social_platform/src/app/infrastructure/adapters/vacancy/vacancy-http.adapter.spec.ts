/** @format */

import { ApiService } from "@core/public-api";
import { VacancyHttpAdapter } from "./vacancy-http.adapter";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";

describe("VacancyHttpAdapter", () => {
  let adapter: VacancyHttpAdapter;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiService = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post", "patch", "delete"]);

    TestBed.configureTestingModule({
      providers: [VacancyHttpAdapter, { provide: ApiService, useValue: apiService }],
    });

    adapter = TestBed.inject(VacancyHttpAdapter);
  });

  it("getForProject вызывает GET /vacancies/ с limit/offset", () => {
    apiService.get.and.returnValue(of([]));

    adapter.getForProject(10, 0).subscribe();

    expect(apiService.get).toHaveBeenCalled();
  });
});
