/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { MemberRepository } from "../../repository/member/member.repository";
import { GetMemberStatisticsUseCase } from "@api/member/use-cases/get-member-statistics.use-case";

describe("Контракт глобальной статистики участников", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "https://local.test" },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
        { provide: LoggerService, useValue: { warn: vi.fn() } },
        { provide: MemberRepositoryPort, useExisting: MemberRepository },
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  function request() {
    const result = firstValueFrom(TestBed.inject(GetMemberStatisticsUseCase).execute());
    const http = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/auth/public-users/stats/",
    );
    expect(http.request.method).toBe("GET");
    expect(http.request.params.keys()).toEqual([]);
    return { result, http };
  }

  it("передаёт четыре snake_case агрегата через interceptor, репозиторий и use-case без фильтров списка", async () => {
    const { result, http } = request();
    http.flush({ total: 1248, in_projects: 684, in_programs: 214, new_last_30_days: 63 });
    expect(await result).toEqual({
      ok: true,
      value: { total: 1248, inProjects: 684, inPrograms: 214, newLast30Days: 63 },
    });
  });

  it("сохраняет реальные нули", async () => {
    const { result, http } = request();
    http.flush({ total: 0, in_projects: 0, in_programs: 0, new_last_30_days: 0 });
    expect(await result).toEqual({
      ok: true,
      value: { total: 0, inProjects: 0, inPrograms: 0, newLast30Days: 0 },
    });
  });

  it.each([
    { total: 4 },
    { total: 4, in_projects: -1, in_programs: 0, new_last_30_days: 0 },
    { total: 4, in_projects: 1.5, in_programs: 0, new_last_30_days: 0 },
    { total: "4", in_projects: 0, in_programs: 0, new_last_30_days: 0 },
  ])("не подменяет неверный контракт нулями: %j", async payload => {
    const { result, http } = request();
    http.flush(payload);
    expect(await result).toEqual({ ok: false, error: "member_statistics_error" });
  });
});
