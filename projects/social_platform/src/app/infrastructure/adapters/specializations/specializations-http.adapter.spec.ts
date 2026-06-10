/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { SpecializationsHttpAdapter } from "./specializations-http.adapter";

describe("SpecializationsHttpAdapter", () => {
  let adapter: SpecializationsHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SpecializationsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(SpecializationsHttpAdapter);
  }

  it("getSpecializationsNested идёт в GET /auth/users/specializations/nested", () => {
    setup();
    api.get.mockReturnValue(of([]));

    adapter.getSpecializationsNested().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/specializations/nested/");
  });

  it("getSpecializationsInline идёт в /inline c limit/offset/name__icontains", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.getSpecializationsInline("dev", 10, 5).subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/auth/users/specializations/inline/");
    expect(params?.get("limit")).toBe("10");
    expect(params?.get("offset")).toBe("5");
    expect(params?.get("name__icontains")).toBe("dev");
  });
});
