/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { MemberRepository } from "./member.repository";
import { MemberHttpAdapter } from "../../adapters/member/member-http.adapter";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("MemberRepository", () => {
  let repository: MemberRepository;
  let adapter: jasmine.SpyObj<MemberHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<MemberHttpAdapter>("MemberHttpAdapter", [
      "getMembers",
      "getMentors",
    ]);
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

  it("getMembers делегирует в adapter и мапит results в User", done => {
    setup();
    adapter.getMembers.and.returnValue(of(page()));

    repository.getMembers(0, 10, { q: "a" }).subscribe(res => {
      expect(adapter.getMembers).toHaveBeenCalledOnceWith(0, 10, { q: "a" });
      expect(res.results[0]).toBeInstanceOf(User);
      done();
    });
  });

  it("getMentors делегирует в adapter и мапит results в User", done => {
    setup();
    adapter.getMentors.and.returnValue(of(page()));

    repository.getMentors(0, 10).subscribe(res => {
      expect(adapter.getMentors).toHaveBeenCalledOnceWith(0, 10);
      expect(res.results[0]).toBeInstanceOf(User);
      done();
    });
  });
});
