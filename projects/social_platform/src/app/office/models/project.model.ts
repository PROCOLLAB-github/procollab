/** @format */

import { Collaborator } from "./collaborator.model";
import { Goal } from "./goals.model";
import { PartnerProgramFields, PartnerProgramFieldsValues } from "./partner-program-fields.model";
import { Partner } from "./partner.model";
import { Resource } from "./resource.model";
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
  targetAudience!: string;
  implementationDeadline!: string;
  trl!: string;
  actuality!: string;
  problem!: string;
  region!: string;
  shortDescription!: string;
  achievements!: { id: number; title: string; status: string }[];
  partners!: Partner[];
  resources!: Resource[];
  goals!: Goal[];
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
  leaderInfo?: { firstName: string; lastName: string };
  partnerProgramsTags?: string[];
  partnerProgram!: PartnerProgramInfo | null;
  vacancies!: Vacancy[];
  isCompany!: boolean;
  inviteId!: number;

  static default(): Project {
    return {
      id: 0,
      name: "string",
      region: "sdf",
      targetAudience: "",
      implementationDeadline: "",
      actuality: "",
      trl: "",
      problem: "",
      description: "string",
      shortDescription: "string",
      achievements: [{ id: 3, title: "sdf", status: "dsaf" }],
      partners: [],
      resources: [],
      goals: [],
      industry: 0,
      viewsCount: 0,
      links: [],
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
      inviteId: 0,
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
