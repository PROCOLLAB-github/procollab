/** @format */

export class Project {
  id!: number;
  name!: string;
  description!: string;
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
  collaborators!: {
    userId: number;
    firstName: string;
    lastName: string;
    role: string;
    keySkills: string[];
    avatar: string;
  }[];

  links!: string[];
  draft!: boolean;
  leader!: number;
  partnerProgramsTags?: string[];

  static default(): Project {
    return {
      id: 0,
      name: "string",
      region: "sdf",
      step: 1,
      description: "string",
      shortDescription: "string",
      achievements: [{ id: 3, title: "sdf", status: "dsaf" }],
      industry: 0,
      viewsCount: 0,
      links: [],
      cover: null,
      presentationAddress: "string",
      imageAddress: "string",
      numberOfCollaborators: 10,
      collaborators: [
        {
          firstName: "string",
          lastName: "string",
          userId: 0,
          avatar: "string",
          keySkills: ["angular"],
          role: "Front-end",
        },
      ],
      draft: false,
      leader: 0,
    };
  }
}

export class ProjectCount {
  all!: number;
  my!: number;
}

export class ProjectStep {
  id!: number;
  name!: string;
}
