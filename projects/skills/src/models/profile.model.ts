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
}

export interface Skill {
  skillId: number;
  skillName: string;
  skillLevel: number;
  skillProgress: number;
}

interface Month {
  month: string;
  isPassed: boolean;
}

export interface Profile {
  userData: UserData;
  skills: Skill[];
  months: Month[];
}
