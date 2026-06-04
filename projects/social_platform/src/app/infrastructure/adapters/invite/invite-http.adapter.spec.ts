/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { InviteHttpAdapter } from "./invite-http.adapter";
import { Invite } from "@domain/invite/invite.model";

describe("InviteHttpAdapter", () => {
  let adapter: InviteHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [InviteHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(InviteHttpAdapter);
  }

  it("sendForUser идёт в POST /invites/ с полями user/project/role/specialization", () => {
    setup();
    api.post.mockReturnValue(of({} as Invite));

    adapter.sendForUser(7, 42, "dev", "frontend").subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/invites/", {
      user: 7,
      project: 42,
      role: "dev",
      specialization: "frontend",
    });
  });

  it("revokeInvite идёт в DELETE /invites/:id", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.revokeInvite(5).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/invites/5/");
  });

  it("acceptInvite идёт в POST /invites/:id/accept/", () => {
    setup();
    api.post.mockReturnValue(of({} as Invite));

    adapter.acceptInvite(5).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/invites/5/accept/", {});
  });

  it("rejectInvite идёт в POST /invites/:id/decline/", () => {
    setup();
    api.post.mockReturnValue(of({} as Invite));

    adapter.rejectInvite(5).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/invites/5/decline/", {});
  });

  it("updateInvite идёт в PATCH /invites/:id с role/specialization", () => {
    setup();
    api.patch.mockReturnValue(of({} as Invite));

    adapter.updateInvite(5, "lead", "backend").subscribe();

    expect(api.patch).toHaveBeenCalledExactlyOnceWith("/invites/5/", {
      role: "lead",
      specialization: "backend",
    });
  });

  it("getMy идёт в GET /invites/", () => {
    setup();
    api.get.mockReturnValue(of([]));

    adapter.getMy().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/invites/");
  });

  it("getByProject идёт в GET /invites/ c project/user=any", () => {
    setup();
    api.get.mockReturnValue(of([]));

    adapter.getByProject(42).subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/invites/");
    expect(params?.get("project")).toBe("42");
    expect(params?.get("user")).toBe("any");
  });
});
