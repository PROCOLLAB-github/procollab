/** @format */
import { TestBed } from "@angular/core/testing";
import { ProjectTeamUIService } from "./project-team-ui.service";
import { User } from "@domain/auth/user.model";
import { Collaborator } from "@domain/project/collaborator.model";
describe("ProjectTeamUIService", () => {
  it("reset очищает только создание приглашения, сохраняет участников и валидаторы", () => {
    TestBed.configureTestingModule({ providers: [ProjectTeamUIService] });
    const ui = TestBed.inject(ProjectTeamUIService);
    ui.collaborators.set([{ userId: 7 } as Collaborator]);
    ui.applyOpenInviteModal();
    ui.selectRecipient({ id: 13 } as User);
    ui.inviteForm.controls.role.setValue("Дизайнер");
    ui.applyErrorSubmitInvite({ kind: "network", message: "Ошибка подключения" });
    ui.applyCloseInviteModal();
    expect(ui.inviteForm.getRawValue()).toEqual({ recipientId: null, role: "" });
    expect(ui.inviteForm.invalid).toBe(true);
    expect(ui.inviteSubmitError()).toBeNull();
    expect(ui.inviteFormIsSubmitting().status).toBe("initial");
    expect(ui.selectedRecipient()).toBeNull();
    expect(ui.collaborators()).toEqual([{ userId: 7 }]);
    expect(Object.keys(ui.inviteForm.controls)).toEqual(["recipientId", "role"]);
  });
});
