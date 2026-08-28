/** @format */

import { ApiService } from "@core/public-api";
import { VacancyHttpAdapter } from "./vacancy-http.adapter";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";

describe("VacancyHttpAdapter", () => {
  let adapter: VacancyHttpAdapter;
  let apiService: any;

  beforeEach(() => {
    apiService = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };

    TestBed.configureTestingModule({
      providers: [VacancyHttpAdapter, { provide: ApiService, useValue: apiService }],
    });

    adapter = TestBed.inject(VacancyHttpAdapter);
  });

  it("getForProject вызывает GET /vacancies/ с limit/offset", () => {
    apiService.get.mockReturnValue(of([]));

    adapter.getForProject(10, 0).subscribe();

    expect(apiService.get).toHaveBeenCalled();
  });

  it("responsesByVacancy использует vacancy-specific manager endpoint", () => {
    apiService.get.mockReturnValue(of([]));

    adapter.responsesByVacancy(42).subscribe();

    expect(apiService.get).toHaveBeenCalledExactlyOnceWith("/vacancies/42/responses/");
  });

  it("acceptResponse и rejectResponse используют lifecycle endpoints", () => {
    apiService.post.mockReturnValue(of({}));

    adapter.acceptResponse(7).subscribe();
    adapter.rejectResponse(8).subscribe();

    expect(apiService.post).toHaveBeenNthCalledWith(1, "/vacancies/responses/7/accept/", {});
    expect(apiService.post).toHaveBeenNthCalledWith(2, "/vacancies/responses/8/decline/", {});
  });
});
