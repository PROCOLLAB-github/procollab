/** @format */

export class Achievement {
  id!: number;
  title!: string;
  status!: string;
}

export class User {
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;
  patronymic!: string;
  aboutMe!: string;
  birthday!: string;
  avatar!: string;
  keySkills!: string[];
  member?: {
    usefulToProject: string;
  };

  speciality!: string;
  userType!: number;
  city!: string;
  region!: string;
  organization!: string;
  achievements!: Achievement[];
  timeCreated!: string;
  timeUpdated!: string;

  static default(): User {
    return {
      firstName: "Егор",
      lastName: "Токарев",
      userType: 2,
      birthday: "23.42.3423",
      city: "234sadfas",
      organization: "dfasdfasdf",
      speciality: "asdfasdfasd",
      keySkills: ["sadf"],
      member: {},
      aboutMe: "sdvadf\nsadfasfasdf\nasdf\nasdfas\nfasdf\n  ",
      id: 0,
      timeCreated: "",
      timeUpdated: "",
    } as User;
  }
}

export class UserRole {
  id!: number;
  name!: string;
}
