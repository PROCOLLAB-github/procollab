/** @format */

import { Provider } from "@angular/core";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SkillsRepository } from "../repository/skills/skills.repository";

export const SKILLS_PROVIDERS: Provider[] = [
  { provide: SkillsRepositoryPort, useExisting: SkillsRepository },
];
