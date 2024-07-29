/** @format */

export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  fileLink: string;
  age: number;
  specialization: string;
  geoPosition: string;
  verificationDate: string;
}

interface Skill {
  skillName: string;
  level: number;
  progress: number;
}

interface Skills {
  [key: string]: Skill;
}

interface Month {
  month: string;
  isPassed: boolean;
}

export interface Profile {
  userData: UserData;
  skills: Skills;
  months: Month[];
}
