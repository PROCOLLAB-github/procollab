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
  links!: string[];
  shortDescription!: string;
  datetimeRegistrationEnds!: string;
  datetimeStarted!: string;
  datetimeFinished!: string;
  viewsCount!: number;
  likesCount!: number;
  isUserLiked!: boolean;
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
      coverImageAddress: "",
      advertisementImageAddress: "",
      shortDescription: "",
      datetimeRegistrationEnds: "",
      datetimeStarted: "",
      datetimeFinished: "",
      viewsCount: 1,
      tag: "",
      likesCount: 1,
      isUserLiked: false,
      isUserMember: false,
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
