/** @format */
import { isTeamFrozen, teamProgramLinkId } from "./team-policy";
import { Project } from "./project.model";

describe("Server team policy", () => {
  const project = {
    teamPolicy: {
      isFrozen: true,
      requiresProgramContext: true,
      programLinkId: null,
      programLinks: [
        { id: 901, programId: 9 },
        { id: 902, programId: 10 },
      ],
    },
    partnerProgram: { isSubmitted: false, programLinkId: 901, programId: 9 },
  } as Project;
  it("учитывает frozen snapshot даже если legacy first link draft", () => {
    expect(isTeamFrozen(project)).toBe(true);
  });
  it("не выбирает первую связь и не путает её с programId", () => {
    expect(teamProgramLinkId(project)).toBeUndefined();
    expect(teamProgramLinkId(project, 9)).toBeUndefined();
    expect(teamProgramLinkId(project, 902)).toBe(902);
  });
  it("единственная связь приходит с backend; старый API не выдумывает контекст", () => {
    expect(
      teamProgramLinkId({
        teamPolicy: { ...project.teamPolicy!, requiresProgramContext: false, programLinkId: 901 },
      }),
    ).toBe(901);
    expect(teamProgramLinkId({})).toBeUndefined();
  });
});
