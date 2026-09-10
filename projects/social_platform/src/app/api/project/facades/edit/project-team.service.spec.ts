/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { Subject, of, throwError } from "rxjs";
import { Invite } from "@domain/invite/invite.model";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { UpdateInviteUseCase } from "@api/invite/use-cases/update-invite.use-case";
import { RevokeInviteUseCase } from "@api/invite/use-cases/revoke-invite.use-case";
import { ProjectTeamService } from "./project-team.service";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";

describe("ProjectTeamService invite submission", () => {
  let service: ProjectTeamService;
  let ui: ProjectTeamUIService;
  let request: Subject<Invite>;
  const repo = { sendForUser: vi.fn() };
  const link = "https://app.procollab.ru/office/profile/13";

  beforeEach(() => {
    request = new Subject<Invite>();
    repo.sendForUser.mockReset().mockReturnValue(request);
    TestBed.configureTestingModule({
      providers: [
        ProjectTeamService,
        ProjectTeamUIService,
        { provide: InviteRepositoryPort, useValue: repo },
        { provide: UpdateInviteUseCase, useValue: {} },
        { provide: RevokeInviteUseCase, useValue: {} },
      ],
    });
    service = TestBed.inject(ProjectTeamService);
    ui = TestBed.inject(ProjectTeamUIService);
    service.setupDynamicValidation();
    ui.showInviteFields.set(true);
    ui.inviteForm.patchValue({ link, role: "Дизайнер" });
  });

  it("keeps the form open while pending, blocks duplicate sends, hides/reset only on success", () => {
    service.submitInvite(5);
    service.submitInvite(5);
    expect(repo.sendForUser).toHaveBeenCalledExactlyOnceWith(13, 5, "Дизайнер", "");
    expect(ui.showInviteFields()).toBe(true);
    expect(ui.inviteFormIsSubmitting().status).toBe("loading");
    const invite = { id: 10, isAccepted: null } as Invite;
    request.next(invite);
    request.complete();
    expect(ui.invites()).toEqual([invite]);
    expect(ui.showInviteFields()).toBe(false);
    expect(ui.link?.value).toBeNull();
    expect(ui.role?.value).toBeNull();
    expect(ui.inviteSubmitError()).toBeNull();
    expect(ui.inviteSubmitInitiated()).toBe(false);
    expect(ui.inviteFormIsSubmitting().status).toBe("initial");
    service.submitInvite(5);
    expect(repo.sendForUser).toHaveBeenCalledTimes(1);
    expect(ui.link?.hasError("required")).toBe(true);
  });

  it.each(["", "not-a-profile-link"])(
    "invalid link '%s' never calls API through real ValidationService",
    value => {
      ui.link?.setValue(value);
      service.submitInvite(5);
      expect(repo.sendForUser).not.toHaveBeenCalled();
      expect(ui.link?.touched).toBe(true);
      expect(ui.inviteForm.invalid).toBe(true);
      expect(ui.inviteFormIsSubmitting().status).toBe("initial");
    },
  );

  it("invalid role blocks API and a new submission clears a previous backend error", () => {
    ui.role?.setValue("");
    ui.applyErrorSubmitInvite({ kind: "unknown", message: "Controlled" });
    service.submitInvite(5);
    expect(repo.sendForUser).not.toHaveBeenCalled();
    expect(ui.inviteSubmitError()).toBeNull();
    expect(ui.role?.hasError("required")).toBe(true);
  });

  it("maps actual HTTP error, preserves values and permits retry", () => {
    service.submitInvite(5);
    request.error(
      new HttpErrorResponse({
        status: 400,
        error: { user: ["Пользователь уже является лидером проекта."] },
      }),
    );
    expect(ui.inviteSubmitError()?.kind).toBe("already_leader");
    expect(ui.inviteFormIsSubmitting().status).toBe("failure");
    expect(ui.showInviteFields()).toBe(true);
    expect(ui.inviteForm.value).toMatchObject({ link, role: "Дизайнер" });
    expect(ui.invites()).toEqual([]);
    repo.sendForUser.mockReturnValue(of({ id: 11 } as Invite));
    service.submitInvite(5);
    expect(repo.sendForUser).toHaveBeenCalledTimes(2);
    expect(ui.showInviteFields()).toBe(false);
    expect(ui.inviteSubmitError()).toBeNull();
  });

  it.each(["link", "role", "specialization"])("editing %s clears only the backend error", field => {
    repo.sendForUser.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: "error" })),
    );
    service.submitInvite(5);
    expect(ui.inviteSubmitError()?.kind).toBe("server");
    ui.inviteForm.get(field)?.setValue(null);
    expect(ui.inviteSubmitError()).toBeNull();
    ui.link?.setValue("");
    expect(ui.link?.hasError("required")).toBe(true);
    ui.link?.setValue("bad");
    expect(ui.link?.hasError("pattern")).toBe(true);
  });

  it("destroy cancels pending request", () => {
    service.submitInvite(5);
    expect(request.observed).toBe(true);
    TestBed.resetTestingModule();
    expect(request.observed).toBe(false);
  });
});
