/** @format */

import { UserData } from "./profile.model";
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
  backgroundColor: string;
  buttonColor: string;
  selectButtonColor: string;
  textColor: string;
  company: string;
  durationMonths: number;
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
  mentorId: number;
  firstMeetingDone: boolean;
  finalMeetingDone: boolean;
  availableSkills: Skill[];
  unavailableSkills: Skill[];
  completedSkills: Skill[];
  activeMonth: number;
  durationMonths: number;
}

export interface Student {
  trajectory: Trajectory;
  finalMeeting: boolean;
  initialMeeting: boolean;
  remainingDays: number;
  userTrajectoryId: number;
  student: UserData;
  mentorId: number;
}
