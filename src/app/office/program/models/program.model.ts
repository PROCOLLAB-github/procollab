/** @format */

export class Program {
  id!: number;
  imageAddress!: string;
  shortDescription!: string;
  datetimeRegistrationEnds!: string;
  datetimeStarted!: string;
  datetimeFinished!: string;
  viewsCount!: number;
  likesCount!: number;
  isUserLiked!: boolean;

  static default(): Program {
    return {
      id: 1,
      imageAddress: "",
      shortDescription: "",
      datetimeRegistrationEnds: "",
      datetimeStarted: "",
      datetimeFinished: "",
      viewsCount: 1,
      likesCount: 1,
      isUserLiked: false,
    };
  }
}
