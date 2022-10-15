/** @format */

export class Project {
  id!: number;
  name!: string;
  description!: string;
  shortDescription!: string;
  achievements!: { title: string; place: string }[];
  industryId!: number;
  presentationAddress!: string;
  imageAddress!: string;
  step!: string;
  numberOfCollaborators!: number;
  collaborators!: {
    id: number;
    name: string;
    surname: string;
    photoAddress: string;
    speciality: string;
  }[];

  draft!: boolean;
  leaderInfo!: string;
  leaderId!: number;

  static default(): Project {
    return {
      id: 0,
      name: "string",
      description: "string",
      shortDescription: "string",
      achievements: [{ title: "sdf", place: "dsaf" }],
      industryId: 0,
      presentationAddress: "string",
      imageAddress: "string",
      step: "идея",
      numberOfCollaborators: 10,
      collaborators: [
        {
          name: "string",
          surname: "string",
          id: 0,
          photoAddress: "string",
          speciality: "Front-end",
        },
      ],
      draft: false,
      leaderInfo: "string",
      leaderId: 0,
    };
  }
}

export class ProjectCount {
  all!: number;
  my!: number;
}

export class ProjectSetp {
  id!: number;
  name!: string;
}
