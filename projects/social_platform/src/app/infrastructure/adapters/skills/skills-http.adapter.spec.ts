/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { SkillsHttpAdapter } from "./skills-http.adapter";

describe("SkillsHttpAdapter", () => {
  let adapter: SkillsHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SkillsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(SkillsHttpAdapter);
  }

  it("getSkillsNested идёт в GET /core/skills/nested", () => {
    setup();
    api.get.mockReturnValue(of([]));

    adapter.getSkillsNested().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/core/skills/nested/");
  });

  it("getSkillsInline идёт в GET /core/skills/inline c limit/offset/name__icontains", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.getSkillsInline("ang", 10, 5).subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/core/skills/inline/");
    expect(params?.get("limit")).toBe("10");
    expect(params?.get("offset")).toBe("5");
    expect(params?.get("name__icontains")).toBe("ang");
  });
});
