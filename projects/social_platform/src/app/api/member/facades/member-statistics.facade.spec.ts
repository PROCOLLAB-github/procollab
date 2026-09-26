/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject, throwError } from "rxjs";
import { MemberStatistics } from "@domain/member/member-statistics.model";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { GetMemberStatisticsUseCase } from "../use-cases/get-member-statistics.use-case";
import { MemberStatisticsFacade } from "./member-statistics.facade";

describe("Состояние глобальной статистики участников", () => {
  const data = { total: 1248, inProjects: 684, inPrograms: 214, newLast30Days: 63 };
  let response: Subject<Result<MemberStatistics, "member_statistics_error">>;
  let execute: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    response = new Subject();
    execute = vi.fn(() => response);
    TestBed.configureTestingModule({
      providers: [
        MemberStatisticsFacade,
        { provide: GetMemberStatisticsUseCase, useValue: { execute } },
      ],
    });
  });

  it("остаётся loading до ответа и выполняет только один запрос за жизнь страницы", () => {
    const facade = TestBed.inject(MemberStatisticsFacade);
    expect(facade.state().status).toBe("loading");
    facade.load();
    facade.load();
    expect(execute).toHaveBeenCalledOnce();
    response.next(ok(data));
    expect(facade.state()).toEqual({ status: "success", data });
  });

  it("сохраняет ошибку и не запускает бесконечные повторы", () => {
    const facade = TestBed.inject(MemberStatisticsFacade);
    facade.load();
    response.next(fail("member_statistics_error"));
    facade.load();
    expect(facade.state().status).toBe("failure");
    expect(execute).toHaveBeenCalledOnce();
  });

  it("отписывается при уходе со страницы: поздний ответ не меняет прежнее состояние", () => {
    const facade = TestBed.inject(MemberStatisticsFacade);
    facade.load();
    TestBed.resetTestingModule();
    expect(response.observed).toBe(false);
    response.next(ok(data));
    expect(facade.state().status).toBe("loading");
  });

  it.each(["network", "HTTP 500 private raw body"])(
    "use-case скрывает техническую ошибку %s",
    message => {
      TestBed.overrideProvider(GetMemberStatisticsUseCase, {
        useFactory: () => new GetMemberStatisticsUseCase(),
      });
      TestBed.configureTestingModule({
        providers: [
          {
            provide: MemberRepositoryPort,
            useValue: { getStatistics: () => throwError(() => new Error(message)) },
          },
        ],
      });
      const facade = TestBed.inject(MemberStatisticsFacade);
      facade.load();
      expect(facade.state()).toMatchObject({ status: "failure", error: "member_statistics_error" });
      expect(JSON.stringify(facade.state())).not.toContain(message);
    },
  );
});
