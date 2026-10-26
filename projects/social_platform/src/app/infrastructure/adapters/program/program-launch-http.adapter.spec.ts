/** @format */
import { TestBed } from "@angular/core/testing";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { API_URL } from "@core/lib/providers";
import { ProgramLaunchHttpAdapter } from "./program-launch-http.adapter";

describe("Создание и первая публикация программы: HTTP contract", () => {
  let adapter: ProgramLaunchHttpAdapter;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgramLaunchHttpAdapter,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "https://local.test" },
        { provide: LoggerService, useValue: { warn: vi.fn() } },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
      ],
    });
    adapter = TestBed.inject(ProgramLaunchHttpAdapter);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("uses the explicit capability, not a global user role", () => {
    adapter.capabilities().subscribe(data => expect(data.canCreateProgram).toBe(false));
    http
      .expectOne("https://local.test/programs/capabilities/")
      .flush({ can_create_program: false });
  });
  it("preserves the idempotency key and does not submit invented dates or permissions", () => {
    const key = "12345678-1234-4234-8234-123456789012";
    adapter.create({ name: "Хакатон", format: "hackathon", idempotencyKey: key }).subscribe();
    const request = http.expectOne("https://local.test/programs/drafts/");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({
      name: "Хакатон",
      format: "hackathon",
      idempotency_key: key,
    });
    request.flush({ id: 7, draft: true, datetime_started: null });
  });
  it("keeps organizer scope and pagination separate from participation filtering", () => {
    adapter.managed({ search: "Город", limit: 10, offset: 20 }).subscribe();
    const request = http.expectOne(r => r.url === "https://local.test/programs/managed/");
    expect(request.request.params.get("offset")).toBe("20");
    expect(request.request.params.get("search")).toBe("Город");
    expect(request.request.params.has("participating")).toBe(false);
    request.flush({ count: 0, results: [], next: null, previous: null });
  });
  it("publishes the program atomically through the launch endpoint with the server revision", () => {
    const revision = "b".repeat(64);
    adapter.publish(7, revision).subscribe();
    const request = http.expectOne("https://local.test/programs/7/management/publish/");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({ revision });
    request.flush({ program: { id: 7, draft: false } });
  });
  it("preview is read-only and never calls enrollment or view endpoints", () => {
    adapter.preview(7).subscribe(data => expect(data.preview).toBe(true));
    const request = http.expectOne("https://local.test/programs/7/management/preview/");
    expect(request.request.method).toBe("GET");
    request.flush({ id: 7, preview: true });
  });
});
