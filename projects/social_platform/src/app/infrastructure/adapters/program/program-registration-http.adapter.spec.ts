/** @format */
import { TestBed } from "@angular/core/testing";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { API_URL } from "@core/lib/providers";
import { ProgramRegistrationHttpAdapter } from "./program-registration-http.adapter";
describe("Контракт регистрации программы", () => {
  let adapter: ProgramRegistrationHttpAdapter, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgramRegistrationHttpAdapter,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "https://local.test" },
        { provide: LoggerService, useValue: { warn: vi.fn() } },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
      ],
    });
    adapter = TestBed.inject(ProgramRegistrationHttpAdapter);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("не меняет динамические идентификаторы ответов при snake/camel преобразовании", () => {
    const key = "f0123456789abcdef0123456789abcdef";
    adapter
      .submit(4, { version: 7, firstName: "Анна", answers: { [key]: "Вуз" } }, true)
      .subscribe();
    const request = http.expectOne("https://local.test/programs/4/registration/signup/");
    expect(request.request.body).toEqual({
      version: 7,
      first_name: "Анна",
      answers: { [key]: "Вуз" },
    });
    request.flush({ receipt: "opaque", email_pending: true });
  });
  it("публикует явную ревизию и не использует endpoint проекта", () => {
    adapter
      .save(4, 2, { mode: "native", fields: [] }, true)
      .subscribe(result => expect(result.publishedVersion).toBe(3));
    const request = http.expectOne(
      "https://local.test/programs/4/management/registration/publish/",
    );
    expect(request.request.method).toBe("POST");
    expect(request.request.body.revision).toBe(2);
    request.flush({ published_version: 3 });
  });
  it("импорт передает бинарный файл без JSON преобразования", () => {
    const file = new File(["Вуз"], "universities.csv");
    adapter.importOptions(4, file).subscribe();
    const request = http.expectOne("https://local.test/programs/4/management/registration/import/");
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get("file")).toBe(file);
    request.flush({ options: ["Вуз"], duplicates: 0, blanks: 0 });
  });
  it("подтверждает почту POST-запросом, не передает токены входа в URL", () => {
    adapter.tokenAction(4, "confirm", "email-proof").subscribe();
    const request = http.expectOne("https://local.test/programs/4/registration/confirm/");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({ token: "email-proof" });
    request.flush({ enrolled: true });
  });
});
