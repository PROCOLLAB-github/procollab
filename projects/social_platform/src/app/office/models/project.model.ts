/** @format */

import { Collaborator } from "./collaborator.model";
import { PartnerProgramFields, PartnerProgramFieldsValues } from "./partner-program-fields.model";
import { Vacancy } from "./vacancy.model";

/**
 * Основная модель проекта и связанные классы
 * Представляет проект со всей необходимой информацией
 *
 * Project содержит:
 * - Основную информацию (название, описание, цели)
 * - Участников и вакансии
 * - Медиа-файлы и ссылки
 *
 * ProjectCount - счетчики проектов по категориям
 * ProjectStep - этапы развития проекта
 */

export class PartnerProgramInfo {
  programLinkId!: number;
  programId!: number;
  isSubmitted!: boolean;
  canSubmit!: boolean;
  programFields!: PartnerProgramFields[];
  programFieldValues!: PartnerProgramFieldsValues[];
}

export class Project {
  id!: number;
  name!: string;
  description!: string;
  track!: string;
  direction!: string;
  actuality!: string;
  goal!: string;
  problem!: string;
  region!: string;
  step!: number;
  shortDescription!: string;
  achievements!: { id: number; title: string; status: string }[];
  industry!: number;
  presentationAddress!: string;
  imageAddress!: string;
  numberOfCollaborators!: number;
  viewsCount!: number;
  cover!: null | string;
  coverImageAddress!: string | null;
  collaborators!: Collaborator[];
  collaborator?: Collaborator;
  links!: string[];
  draft!: boolean;
  leader!: number;
  partnerProgramsTags?: string[];
  partnerProgramId!: number | null;
  partnerProgram!: PartnerProgramInfo | null;
  vacancies!: Vacancy[];
  isCompany!: boolean;

  static default(): Project {
    return {
      id: 0,
      name: "string",
      region: "sdf",
      step: 1,
      track: "",
      direction: "",
      actuality: "",
      goal: "",
      problem: "",
      description: "string",
      shortDescription: "string",
      achievements: [{ id: 3, title: "sdf", status: "dsaf" }],
      industry: 0,
      viewsCount: 0,
      links: [],
      partnerProgramId: null,
      partnerProgram: null,
      cover: null,
      coverImageAddress: null,
      presentationAddress: "string",
      imageAddress: "string",
      numberOfCollaborators: 10,
      collaborators: [collaborator],
      draft: false,
      leader: 0,
      vacancies: [],
      isCompany: true,
    };
  }
}

export class ProjectCount {
  all!: number;
  my!: number;
  subs!: number;
}

export class ProjectStep {
  id!: number;
  name!: string;
}

const collaborator = {
  firstName: "string",
  lastName: "string",
  userId: 0,
  avatar: "string",
  skills: [
    {
      id: 309,
      name: "Python",
      category: {
        id: 7,
        name: "Back-end",
      },
    },
  ],
  role: "Front-end",
};
