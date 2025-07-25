/** @format */

import { Collaborator } from "./collaborator.model";
import { Vacancy } from "./vacancy.model";

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
  keySkills: ["angular"],
  role: "Front-end",
};
