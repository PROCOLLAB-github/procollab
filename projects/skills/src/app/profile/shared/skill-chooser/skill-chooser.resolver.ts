import { inject } from "@angular/core"
import { SkillService } from "../../../skills/services/skill.service"

export const skillChooserResolver = () => {
  const skillsService = inject(SkillService);
  return skillsService.getAll();
}
