/** @format */

import { Skill } from "./skill.model";

interface SkillInfo {
  fileLink: string | null;
  name: string;
}

export interface Trajectory {
  id: number;
  name: string;
  description: string;
  isActiveForUser: boolean;
  avatar: string | null;
  mentors: number[];
  skills: SkillInfo[];
}

export interface TrajectorySkills {
  availableSkills: Skill[];
  unavailableSkills: Skill[];
  completedSkills: Skill[];
}

export interface UserTrajectory {
  trajectoryId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  mentorFirstName: string;
  mentorLastName: string;
  mentorAvatar: string | null;
  firstMeetingDone: boolean;
  finalMeetingDone: boolean;
  availableSkills: Skill[];
  unavailableSkills: Skill[];
  completedSkills: Skill[];
  activeMonth: number;
}
