/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectTeamUIService } from "./project-team-ui.service";

describe("ProjectTeamUIService", () => {
  it("reset preserves frontend validation and clears only invite transient state", () => {
    TestBed.configureTestingModule({ providers: [ProjectTeamUIService] });
    const ui = TestBed.inject(ProjectTeamUIService);
    ui.inviteForm.patchValue({ link: "bad", role: "Дизайнер" });
    ui.inviteSubmitInitiated.set(true);
    ui.applyErrorSubmitInvite({ kind: "network", message: "Controlled network message" });
    ui.resetInviteForm();
    expect(ui.inviteForm.invalid).toBe(true);
    expect(ui.link?.hasError("required")).toBe(true);
    expect(ui.role?.hasError("required")).toBe(true);
    expect(ui.inviteSubmitError()).toBeNull();
    expect(ui.inviteSubmitInitiated()).toBe(false);
    expect(ui.inviteFormIsSubmitting().status).toBe("initial");
    ui.link?.setValue("invalid");
    expect(ui.link?.hasError("pattern")).toBe(true);
  });
});
