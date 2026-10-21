/** @format */
import { TestBed } from "@angular/core/testing";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { Router } from "@angular/router";
import { BearerTokenInterceptor } from "./bearer-token.interceptor";
import { TokenService } from "../services/tokens/token.service";
import { Tokens } from "../models/auth/tokens.model";

const target = "/office/program/7/management/participants?activity=active&order=activity_desc";
const renewed = { access: "renewed-access", refresh: "rotated-refresh" };
describe("BearerTokenInterceptor: восстановление сессии", () => {
  let http: HttpClient, backend: HttpTestingController;
  let session: Tokens | null;
  const router = { url: target, navigateByUrl: vi.fn().mockResolvedValue(true) };
  const tokens = {
    getTokens: vi.fn(() => session),
    memTokens: vi.fn((value: Tokens) => {
      session = value;
    }),
    clearTokens: vi.fn(() => {
      session = null;
    }),
    refreshTokens: vi.fn(() =>
      http.post<Tokens>("/api/token/refresh/", { refresh: session?.refresh }),
    ),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    router.url = target;
    session = { access: "expired-access", refresh: "valid-refresh" };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptor, multi: true },
        { provide: TokenService, useValue: tokens },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });
  afterEach(() => backend.verify());
  function unauthorized(url: string) {
    backend.expectOne(url).flush(null, { status: 401, statusText: "Unauthorized" });
  }
  function refresh() {
    return backend.expectOne("/api/token/refresh/");
  }
  function success(url: string) {
    const retry = backend.expectOne(url);
    expect(retry.request.headers.get("Authorization")).toBe("Bearer renewed-access");
    retry.flush({ ok: true });
  }

  it("передает Bearer и сохраняет успешный запрос без refresh", () => {
    const next = vi.fn();
    http.get("/programs/7/management/").subscribe(next);
    const req = backend.expectOne("/programs/7/management/");
    expect(req.request.headers.get("Authorization")).toBe("Bearer expired-access");
    expect(req.request.headers.get("Accept")).toBe("application/json");
    req.flush({ ok: true });
    expect(next).toHaveBeenCalledOnce();
    expect(tokens.refreshTokens).not.toHaveBeenCalled();
  });
  it("обновляет один раз и завершает оба параллельных запроса", () => {
    const first = vi.fn(),
      second = vi.fn();
    http.get("/first").subscribe(first);
    http.get("/second").subscribe(second);
    unauthorized("/first");
    unauthorized("/second");
    const req = refresh();
    expect(req.request.headers.has("Authorization")).toBe(false);
    expect(req.request.body).toEqual({ refresh: "valid-refresh" });
    req.flush(renewed);
    success("/first");
    success("/second");
    expect(tokens.refreshTokens).toHaveBeenCalledOnce();
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });
  it("ошибка refresh завершает всех ожидающих и открывает вход с исходным URL", () => {
    const first = vi.fn(),
      second = vi.fn();
    http.get("/first").subscribe({ error: first });
    http.get("/second").subscribe({ error: second });
    unauthorized("/first");
    unauthorized("/second");
    refresh().flush({}, { status: 401, statusText: "Expired" });
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(tokens.clearTokens).toHaveBeenCalledOnce();
    expect(session).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith(
      "/auth/login?returnUrl=" + encodeURIComponent(target),
    );
  });
  it("сетевой сбой refresh сохраняет сессию и допускает следующую попытку", () => {
    const first = vi.fn(),
      second = vi.fn();
    http.get("/first").subscribe({ error: first });
    http.get("/second").subscribe({ error: second });
    unauthorized("/first");
    unauthorized("/second");
    refresh().flush({}, { status: 503, statusText: "Unavailable" });
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(tokens.clearTokens).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    http.get("/again").subscribe();
    unauthorized("/again");
    refresh().flush(renewed);
    success("/again");
    expect(tokens.refreshTokens).toHaveBeenCalledTimes(2);
  });
  it("отмена инициатора не прерывает refresh и не оставляет следующий запрос в ожидании", () => {
    const first = http.get("/first").subscribe();
    unauthorized("/first");
    const req = refresh();
    first.unsubscribe();
    expect(req.cancelled).toBe(false);
    const second = vi.fn();
    http.get("/second").subscribe(second);
    unauthorized("/second");
    req.flush(renewed);
    success("/second");
    backend.expectNone("/first");
    expect(second).toHaveBeenCalledOnce();
    expect(tokens.refreshTokens).toHaveBeenCalledOnce();
  });
  it("поздний401 старого access использует уже обновленную пару", () => {
    http.get("/first").subscribe();
    http.get("/late").subscribe();
    unauthorized("/first");
    refresh().flush(renewed);
    success("/first");
    unauthorized("/late");
    success("/late");
    expect(tokens.refreshTokens).toHaveBeenCalledOnce();
  });
  it.each([null, { access: "new-account", refresh: "new-account-refresh" }])(
    "поздний refresh не восстанавливает прошлую сессию: %j",
    changed => {
      const error = vi.fn();
      http.get("/first").subscribe({ error });
      unauthorized("/first");
      const req = refresh();
      session = changed;
      req.flush(renewed);
      expect(error).toHaveBeenCalledOnce();
      expect(tokens.memTokens).not.toHaveBeenCalled();
      expect(session).toEqual(changed);
      expect(tokens.clearTokens).not.toHaveBeenCalled();
    },
  );
  it("повторно отвергнутый новый access не запускает цикл обновления", () => {
    const error = vi.fn();
    http.get("/first").subscribe({ error });
    unauthorized("/first");
    refresh().flush(renewed);
    unauthorized("/first");
    expect(error).toHaveBeenCalledOnce();
    expect(tokens.refreshTokens).toHaveBeenCalledOnce();
    expect(tokens.clearTokens).toHaveBeenCalledOnce();
  });
  it("при пропавших cookies на защищенной странице предлагает новый вход", () => {
    session = null;
    http.get("/first").subscribe({ error: vi.fn() });
    unauthorized("/first");
    expect(tokens.refreshTokens).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith(
      "/auth/login?returnUrl=" + encodeURIComponent(target),
    );
  });
  it("не перенаправляет анонимную публичную страницу из-за401", () => {
    session = null;
    router.url = "/programs/7/register";
    http.get("/first").subscribe({ error: vi.fn() });
    unauthorized("/first");
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
  it("не обновляет сессию при неверном пароле и не маскирует403 доступа", () => {
    http
      .post("/api/token/", { email: "test@example.test", password: "invalid" })
      .subscribe({ error: vi.fn() });
    unauthorized("/api/token/");
    http.get("/forbidden").subscribe({ error: vi.fn() });
    backend.expectOne("/forbidden").flush({}, { status: 403, statusText: "Forbidden" });
    expect(tokens.refreshTokens).not.toHaveBeenCalled();
    expect(tokens.clearTokens).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
  it("сохраняет Blob/Accept и тело POST при однократном повторе", () => {
    http.get("/export/", { responseType: "blob" }).subscribe();
    unauthorized("/export/");
    refresh().flush(renewed);
    const file = backend.expectOne("/export/");
    expect(file.request.responseType).toBe("blob");
    expect(file.request.headers.has("Accept")).toBe(false);
    file.flush(new Blob(["xlsx"]));
    http.post("/write", { ids: [1, 2] }, { headers: { Accept: "custom" } }).subscribe();
    unauthorized("/write");
    refresh().flush(renewed);
    const post = backend.expectOne("/write");
    expect(post.request.method).toBe("POST");
    expect(post.request.body).toEqual({ ids: [1, 2] });
    expect(post.request.headers.get("Accept")).toBe("custom");
    post.flush({ ok: true });
  });
});
