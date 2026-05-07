/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { InviteHttpAdapter } from "./invite-http.adapter";
import { Invite } from "@domain/invite/invite.model";

describe("InviteHttpAdapter", () => {
  let adapter: InviteHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post", "patch", "delete"]);
    TestBed.configureTestingModule({
      providers: [InviteHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(InviteHttpAdapter);
  }

  it("sendForUser идёт в POST /invites/ с полями user/project/role/specialization", () => {
    setup();
    api.post.and.returnValue(of({} as Invite));

    adapter.sendForUser(7, 42, "dev", "frontend").subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/invites/", {
      user: 7,
      project: 42,
      role: "dev",
      specialization: "frontend",
    });
  });

  it("revokeInvite идёт в DELETE /invites/:id", () => {
    setup();
    api.delete.and.returnValue(of(undefined));

    adapter.revokeInvite(5).subscribe();

    expect(api.delete).toHaveBeenCalledOnceWith("/invites/5");
  });

  it("acceptInvite идёт в POST /invites/:id/accept/", () => {
    setup();
    api.post.and.returnValue(of({} as Invite));

    adapter.acceptInvite(5).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/invites/5/accept/", {});
  });

  it("rejectInvite идёт в POST /invites/:id/decline/", () => {
    setup();
    api.post.and.returnValue(of({} as Invite));

    adapter.rejectInvite(5).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/invites/5/decline/", {});
  });

  it("updateInvite идёт в PATCH /invites/:id с role/specialization", () => {
    setup();
    api.patch.and.returnValue(of({} as Invite));

    adapter.updateInvite(5, "lead", "backend").subscribe();

    expect(api.patch).toHaveBeenCalledOnceWith("/invites/5", {
      role: "lead",
      specialization: "backend",
    });
  });

  it("getMy идёт в GET /invites/", () => {
    setup();
    api.get.and.returnValue(of([]));

    adapter.getMy().subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/invites/");
  });

  it("getByProject идёт в GET /invites/ c project/user=any", () => {
    setup();
    api.get.and.returnValue(of([]));

    adapter.getByProject(42).subscribe();

    const [url, params] = api.get.calls.mostRecent().args;
    expect(url).toBe("/invites/");
    expect(params?.get("project")).toBe("42");
    expect(params?.get("user")).toBe("any");
  });
});
