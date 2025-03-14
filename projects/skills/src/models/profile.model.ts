/** @format */

export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  fileLink: string;
  avatar: string;
  age: number;
  specialization: string;
  geoPosition: string;
  verificationDate: string;
  points: number;
  isMentor: boolean;
}

export interface Skill {
  skillId: number;
  skillName: string;
  skillLevel: number;
  skillProgress: number;
  fileLink: string;
}

export interface Month {
  month: string;
  successfullyDone: boolean;
  year?: number;
}

export interface Profile {
  userData: UserData;
  skills: Skill[];
  months: Month[];
}
