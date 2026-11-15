/** @format */
import { TestBed } from "@angular/core/testing";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { API_URL, CamelcaseInterceptor } from "@corelib";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { InstanceHttpAdapter } from "./instance-http.adapter";

it("пилот читает brand metadata со своего /backend и сохраняет casing", () => {
  TestBed.configureTestingModule({
    providers: [
      InstanceHttpAdapter,
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      { provide: API_URL, useValue: "/backend" },
      { provide: LoggerService, useValue: { warn: vi.fn() } },
      { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
    ],
  });
  TestBed.inject(InstanceHttpAdapter)
    .config()
    .subscribe(data => {
      expect(data.brandName).toBe("Сознание права");
      expect(data.programId).toBe(1);
      expect(data.logoBackground).toBe("dark");
    });
  const http = TestBed.inject(HttpTestingController);
  http
    .expectOne("/backend/instance/")
    .flush({ enabled: true, program_id: 1, brand_name: "Сознание права", logo_background: "dark" });
  http.verify();
});
