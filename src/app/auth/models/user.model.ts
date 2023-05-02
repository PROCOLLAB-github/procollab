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

  mentor?: {
    usefulToProject: string;
    preferredIndustries: string[];
  };

  expert?: {
    usefulToProject: string;
    preferredIndustries: string[];
  };

  investor?: {
    preferredIndustries: string[];
  };

  onboardingStage!: number | null;
  speciality!: string;
  userType!: number;
  city!: string;
  region!: string;
  organization!: string;
  achievements!: Achievement[];
  timeCreated!: string;
  timeUpdated!: string;
  verificationDate!: string;

  doesCompleted(): boolean {
    return this.onboardingStage === null;
  }

  static default(): User {
    return {
      firstName: "Егор",
      lastName: "Токарев",
      userType: 2,
      email: "example@google.com",
      birthday: "23.42.3423",
      city: "234sadfas",
      organization: "dfasdfasdf",
      onboardingStage: null,
      speciality: "asdfasdfasd",
      avatar:
        "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/07/07b5228efb2df4d2ded575a785f5dedec1db2687.jpg",
      keySkills: ["sadf"],
      member: {},
      aboutMe: "sdvadf\nsadfasfasdf\nasdf\nasdfas\nfasdf\n  ",
      id: 0,
      timeCreated: "",
      timeUpdated: "",
      verificationDate: "",
    } as User;
  }
}

export class UserRole {
  id!: number;
  name!: string;
}
