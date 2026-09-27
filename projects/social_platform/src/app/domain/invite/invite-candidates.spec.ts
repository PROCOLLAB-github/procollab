/** @format */
import { inviteCandidateReason, inviteProgramId } from "./invite-candidates";
import { Project } from "@domain/project/project.model";
import { Collaborator } from "@domain/project/collaborator.model";
import { Invite } from "./invite.model";
describe("Контекст приглашения", () => {
  it("использует только programId, не programLinkId/id связи", () => {
    expect(
      inviteProgramId({ partnerProgram: { programId: 27, programLinkId: 81, id: 81 } } as Project),
    ).toBe(27);
    for (const project of [
      null,
      {},
      { partnerProgram: { id: 81, programLinkId: 81 } },
      { partnerProgram: { programId: 0 } },
      { partnerProgram: { programId: "27" } },
    ]) {
      expect(inviteProgramId(project as Project | null)).toBeNull();
    }
  });
  it("показывает причины leader/member/pending, разрешает отклонённое приглашение", () => {
    const collaborators = [{ userId: 2 }] as Collaborator[];
    const invites = [
      { user: { id: 3 }, isAccepted: null },
      { user: { id: 4 }, isAccepted: false },
    ] as Invite[];
    expect(inviteCandidateReason(1, 1, collaborators, invites)).toBe("Руководитель проекта");
    expect(inviteCandidateReason(2, 1, collaborators, invites)).toBe("Уже в команде");
    expect(inviteCandidateReason(3, 1, collaborators, invites)).toBe("Приглашение уже отправлено");
    expect(inviteCandidateReason(4, 1, collaborators, invites)).toBeNull();
  });
});
