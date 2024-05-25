/** @format */

interface UserData {
  firstName: string;
  lastName: string;
  age: number;
  specialization: string;
  geoPosition: string;
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
export interface PaymentStatus {
  id: string;
  status: string;
  amount: {
    currency: string;
    value: string;
  };
  createdAt: string; // ISO 8601 formatted date-time string
  confirmation: {
    confirmationUrl: string;
    type: string;
  };
  paid: boolean;
  test: boolean;
  metadata: {
    userProfileId: string;
  };
}
