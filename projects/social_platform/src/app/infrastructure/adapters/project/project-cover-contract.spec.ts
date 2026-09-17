/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { API_URL } from "@core/lib/providers";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProjectHttpAdapter } from "./project-http.adapter";

describe("Контракт стандартной обложки через HTTP и общий interceptor", () => {
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

  it.each([true, false])("detail преобразует is_default_cover=%s в модель Angular", flag => {
    TestBed.inject(ProjectHttpAdapter)
      .fetchOne(31)
      .subscribe(value => {
        expect(value.isDefaultCover).toBe(flag);
        expect(value.coverImageAddress).toBe("https://files.test/cover.png");
      });
    TestBed.inject(HttpTestingController).expectOne("https://local.test/projects/31/").flush({
      id: 31,
      is_default_cover: flag,
      cover_image_address: "https://files.test/cover.png",
    });
  });

  it("POST reset-cover возвращает новый URL и серверный флаг", () => {
    TestBed.inject(ProjectHttpAdapter)
      .resetCover(31)
      .subscribe(value => {
        expect(value).toEqual({
          coverImageAddress: "https://files.test/default.png",
          isDefaultCover: true,
        });
      });
    const req = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/projects/31/reset-cover/",
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({});
    req.flush({ cover_image_address: "https://files.test/default.png", is_default_cover: true });
  });
});
