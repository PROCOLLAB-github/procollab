/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { MemberHttpAdapter } from "./member-http.adapter";

describe("MemberHttpAdapter", () => {
  let adapter: MemberHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn() };
    TestBed.configureTestingModule({
      providers: [MemberHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(MemberHttpAdapter);
  }

  it("getMembers идёт в /auth/public-users/ c user_type=1 и limit/offset", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.getMembers(20, 10).subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/auth/public-users/");
    expect(params?.get("user_type")).toBe("1");
    expect(params?.get("limit")).toBe("10");
    expect(params?.get("offset")).toBe("20");
  });

  it("getMembers добавляет дополнительные параметры", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.getMembers(0, 10, { city: "msk" }).subscribe();

    const params = api.get.mock.lastCall[1];
    expect(params?.get("city")).toBe("msk");
  });
});
