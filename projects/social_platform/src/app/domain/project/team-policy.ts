/** @format */

import { Project } from "./project.model";

/** Совместимость с прежним API; новый snapshot учитывает все связи проекта. */
export function isTeamFrozen(project: Pick<Project, "teamPolicy" | "partnerProgram">): boolean {
  return project.teamPolicy?.isFrozen ?? !!project.partnerProgram?.isSubmitted;
}

/** ID принадлежит связи Project × Program; programId никогда не является fallback. */
export function teamProgramLinkId(
  project: Pick<Project, "teamPolicy">,
  selectedLinkId?: number | null,
): number | undefined {
  const policy = project.teamPolicy;
  if (!policy) return undefined;
  if (selectedLinkId && policy.programLinks.some(link => link.id === selectedLinkId)) {
    return selectedLinkId;
  }
  return policy.requiresProgramContext ? undefined : (policy.programLinkId ?? undefined);
}
