/** @format */

export class User {
  id!: number;
  email!: string;
  name!: string;
  surname!: string;
  patronymic!: string;
  aboutMe!: string;
  birthday!: string;
  photoAddress!: string;
  keySkills!: string[];
  usefulToProject!: string;
  speciality!: string;
  status!: string;
  city!: string;
  region!: string;
  organisation!: string;
  achievements!: { title: string; place: string }[];
  tags!: string;
  timeCreated!: string;
  timeUpdated!: string;

  static default(): User {
    return {
      name: "Егор",
      surname: "Токарев",
      status: "Ментор",
      birthday: "23.42.3423",
      city: "234sadfas",
      organisation: "dfasdfasdf",
      speciality: "asdfasdfasd",
      keySkills: ["sadf"],
      achievements: [{ title: "string", place: "string" }],
      aboutMe: "sdvadf\nsadfasfasdf\nasdf\nasdfas\nfasdf\n  ",
      id: 0,
      timeCreated: "",
      timeUpdated: "",
    } as User;
  }
}
