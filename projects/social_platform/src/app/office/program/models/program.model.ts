/** @format */

export class Program {
  id!: number;
  imageAddress!: string;
  coverImageAddress!: string;
  presentationAddress!: string;
  advertisementImageAddress!: string;
  name!: string;
  description!: string;
  city!: string;
  tag!: string;
  year!: number;
  links!: string[];
  materials!: { title: string; url: string }[];
  shortDescription!: string;
  datetimeRegistrationEnds!: string;
  datetimeStarted!: string;
  datetimeFinished!: string;
  viewsCount!: number;
  likesCount!: number;
  isUserLiked!: boolean;
  isUserManager?: boolean;
  isUserMember?: boolean;

  static default(): Program {
    return {
      id: 1,
      name: "",
      description: "",
      city: "",
      imageAddress: "",
      presentationAddress: "",
      links: [],
      materials: [],
      coverImageAddress: "",
      advertisementImageAddress: "",
      shortDescription: "",
      datetimeRegistrationEnds: "",
      datetimeStarted: "",
      datetimeFinished: "",
      viewsCount: 1,
      tag: "",
      likesCount: 1,
      year: 0,
      isUserLiked: false,
      isUserMember: false,
      isUserManager: false,
    };
  }
}

export class ProgramDataSchema {
  [key: string]: {
    type: "text";
    name: string;
    placeholder: string;
  };
}

export class ProgramTag {
  id!: number;
  name!: string;
  tag!: string;
}
