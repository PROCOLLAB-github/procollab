/** @format */

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Project } from "@domain/project/project.model";

type ProjectAchievement = Project["achievements"][number];

export function createProjectForm(fb: FormBuilder): FormGroup {
  return fb.group({
    imageAddress: [""],
    name: ["", [Validators.required]],
    region: ["", [Validators.required]],
    implementationDeadline: [null],
    trl: [null],
    links: fb.array([]),
    link: ["", Validators.pattern(/^(https?:\/\/)/)],
    industryId: [undefined, [Validators.required]],
    description: ["", [Validators.required, Validators.minLength(0), Validators.maxLength(800)]],
    presentationAddress: [""],
    coverImageAddress: ["", [Validators.required]],
    actuality: ["", [Validators.maxLength(400)]],
    targetAudience: ["", [Validators.required, Validators.maxLength(400)]],
    problem: ["", [Validators.required, Validators.maxLength(400)]],
    partnerProgramId: [null],
    achievements: fb.array([]),
    title: [""],
    status: [""],
    draft: [null],
  });
}

export function createProjectAchievementGroup(
  fb: FormBuilder,
  achievement: Partial<ProjectAchievement>,
  index: number,
  currentYear = new Date().getFullYear()
): FormGroup {
  return fb.group({
    id: achievement.id ?? index,
    title: [achievement.title || "", Validators.required],
    status: [
      achievement.status || "",
      [
        Validators.required,
        Validators.min(2000),
        Validators.max(currentYear),
        Validators.pattern(/^\d{4}$/),
      ],
    ],
  });
}
