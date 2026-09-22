/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProjectHttpAdapter } from "./project-http.adapter";

describe("Контракт статистики проектов через общий interceptor", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "https://local.test" },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
        { provide: LoggerService, useValue: { warn: vi.fn() } },
      ],
    }),
  );

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it("преобразует snake_case метрик в camelCase Angular domain", () => {
    TestBed.inject(ProjectHttpAdapter)
      .fetchCount()
      .subscribe(value => {
        expect(value).toEqual({
          all: 12,
          my: 7,
          myLeader: 4,
          myInProgram: 2,
          mySubmitted: 1,
        });
      });

    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/projects/count/",
    );
    expect(request.request.method).toBe("GET");
    request.flush({
      all: 12,
      my: 7,
      my_leader: 4,
      my_in_program: 2,
      my_submitted: 1,
    });
  });
});
