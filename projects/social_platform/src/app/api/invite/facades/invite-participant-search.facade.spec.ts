/** @format */
import { TestBed } from "@angular/core/testing";
import { Subject, of } from "rxjs";
import { ApiService } from "@corelib";
import { GetMembersUseCase } from "@api/member/use-cases/get-members.use-case";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { MemberHttpAdapter } from "@infrastructure/adapters/member/member-http.adapter";
import { InviteParticipantSearchFacade } from "./invite-participant-search.facade";
describe("Поиск кандидатов приглашения", () => {
  const getMembers = { execute: vi.fn() };
  beforeEach(() => {
    vi.useFakeTimers();
    getMembers.execute.mockReset().mockReturnValue(of({ ok: true, value: { results: [] } }));
  });
  afterEach(() => vi.useRealTimers());
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        InviteParticipantSearchFacade,
        { provide: GetMembersUseCase, useValue: getMembers },
      ],
    });
    return TestBed.inject(InviteParticipantSearchFacade);
  }
  it("минимум два символа, нормализация, debounce 300, distinct", () => {
    const facade = setup();
    facade.search(" И ", null);
    vi.advanceTimersByTime(500);
    expect(getMembers.execute).not.toHaveBeenCalled();
    expect(facade.state().status).toBe("initial");
    facade.search("  Иван   Иванов  ", null);
    vi.advanceTimersByTime(299);
    expect(getMembers.execute).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(getMembers.execute).toHaveBeenCalledExactlyOnceWith(0, 8, { fullname: "Иван Иванов" });
    facade.search("Иван Иванов", null);
    vi.advanceTimersByTime(500);
    expect(getMembers.execute).toHaveBeenCalledTimes(1);
  });
  it("сразу отменяет старый запрос; медленный ответ не заменяет новый", () => {
    const old = new Subject<any>();
    getMembers.execute.mockReturnValueOnce(old);
    const facade = setup();
    facade.search("Иван", 2);
    vi.advanceTimersByTime(300);
    expect(old.observed).toBe(true);
    facade.search("Анна", 3);
    expect(old.observed).toBe(false);
    old.next({ ok: true, value: { results: [{ id: 99 }] } });
    vi.advanceTimersByTime(300);
    expect(getMembers.execute).toHaveBeenLastCalledWith(0, 8, {
      fullname: "Анна",
      partner_program: 3,
    });
    expect(facade.state().users).toEqual([]);
  });
  it("короткий запрос и демонтаж отменяют ожидание/HTTP", () => {
    const response = new Subject<any>();
    getMembers.execute.mockReturnValue(response);
    const facade = setup();
    facade.search("Иван", null);
    vi.advanceTimersByTime(300);
    facade.search("", null);
    expect(response.observed).toBe(false);
    expect(facade.state().status).toBe("initial");
    facade.search("Анна", null);
    TestBed.resetTestingModule();
    vi.advanceTimersByTime(300);
    expect(getMembers.execute).toHaveBeenCalledTimes(1);
  });
  it("контракт реального use case и adapter: public-users, один user_type=1, offset=0, limit=8, program", () => {
    const api = {
      get: vi.fn().mockReturnValue(of({ count: 0, results: [], next: "", previous: "" })),
    };
    TestBed.configureTestingModule({
      providers: [
        InviteParticipantSearchFacade,
        GetMembersUseCase,
        { provide: MemberRepositoryPort, useClass: MemberHttpAdapter },
        { provide: ApiService, useValue: api },
      ],
    });
    const facade = TestBed.inject(InviteParticipantSearchFacade);
    facade.search("  Иван   Петров ", 27);
    vi.advanceTimersByTime(300);
    const [url, params] = api.get.mock.lastCall!;
    expect(url).toBe("/auth/public-users/");
    expect(params.getAll("user_type")).toEqual(["1"]);
    expect(params.get("limit")).toBe("8");
    expect(params.get("offset")).toBe("0");
    expect(params.get("fullname")).toBe("Иван Петров");
    expect(params.get("partner_program")).toBe("27");
  });
});
