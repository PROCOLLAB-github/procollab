/** @format */
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { EvaluationHttpAdapter } from "./evaluation-http.adapter";

describe("Expert cabinet HTTP contract", () => {
  it("encodes the additive server query without changing the legacy summary request", () => {
    const api = { get: vi.fn((_url: string) => of({})) };
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    const adapter = TestBed.inject(EvaluationHttpAdapter);
    adapter
      .cabinet({ status: "completed", q: "A&B / Кейс", programId: 7, limit: 20, offset: 40 })
      .subscribe();
    const url = new URL(api.get.mock.calls[0][0] as string, "https://example.test");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      include: "projects",
      status: "completed",
      q: "A&B / Кейс",
      program_id: "7",
      limit: "20",
      offset: "40",
    });
    adapter.programs().subscribe();
    expect(api.get).toHaveBeenLastCalledWith("/evaluation/programs/");
  });
});
