/** @format */

/** Основная модель программы */
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
  registrationLink!: string | null;
  materials!: { title: string; url: string }[];
  shortDescription!: string;
  datetimeRegistrationEnds!: string;
  datetimeStarted!: string;
  datetimeFinished!: string;
  datetimeProjectSubmissionEnds!: string;
  datetimeEvaluationEnds!: string;
  viewsCount!: number;
  likesCount!: number;
  isUserLiked!: boolean;
  isUserManager!: boolean;
  isUserMember!: boolean;
  publishProjectsAfterFinish!: boolean;
  courseId!: number | null;
  courses!: { id: number; title: string; isAvailable: boolean }[];

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
      registrationLink: null,
      coverImageAddress: "",
      advertisementImageAddress: "",
      shortDescription: "",
      datetimeRegistrationEnds: "",
      datetimeStarted: "",
      datetimeFinished: "",
      datetimeProjectSubmissionEnds: "",
      datetimeEvaluationEnds: "",
      viewsCount: 1,
      tag: "",
      likesCount: 1,
      year: 0,
      isUserLiked: false,
      isUserMember: false,
      isUserManager: false,
      publishProjectsAfterFinish: false,
      courseId: null,
      courses: [],
    };
  }
}

/** Схема данных программы для динамических полей */
export class ProgramDataSchema {
  [key: string]: {
    type: "text";
    name: string;
    placeholder: string;
  };
}
