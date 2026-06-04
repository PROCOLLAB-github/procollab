/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { MemberRepository } from "./member.repository";
import { MemberHttpAdapter } from "../../adapters/member/member-http.adapter";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("MemberRepository", () => {
  let repository: MemberRepository;
  let adapter: any;

  function setup(): void {
    adapter = { getMembers: vi.fn() };
    TestBed.configureTestingModule({
      providers: [MemberRepository, { provide: MemberHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(MemberRepository);
  }

  const page = (): ApiPagination<User> => ({
    count: 1,
    next: "",
    previous: "",
    results: [{ id: 1 } as User],
  });

  it("getMembers делегирует в adapter и мапит results в User", () =>
    new Promise<void>(done => {
      setup();
      adapter.getMembers.mockReturnValue(of(page()));

      repository.getMembers(0, 10, { q: "a" }).subscribe(res => {
        expect(adapter.getMembers).toHaveBeenCalledExactlyOnceWith(0, 10, { q: "a" });
        expect(res.results[0]).toBeInstanceOf(User);
        done();
      });
    }));
});
