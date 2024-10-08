/** @format */

export interface Approve {
  confirmedBy: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
    speciality: string;
    v2Speciality: {
      id: number;
      name: string;
    };
  };
}

export interface Skill {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  approves: Approve[];
}
