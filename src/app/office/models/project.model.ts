/** @format */

export class Project {
  id!: number;
  name!: string;
  description!: string;
  shortDescription!: string;
  achievements!: string;
  industryId!: number;
  presentationAddress!: string;
  imageAddress!: string;
  numberOfCollaborators!: number;
  collaborators!: { name: string; surname: string; id: number; photoAddress: string }[];
  leaderInfo!: string;
  leaderId!: number;

  static default(): Project {
    return {
      id: 0,
      name: "string",
      description: "string",
      shortDescription: "string",
      achievements: "string",
      industryId: 0,
      presentationAddress: "string",
      imageAddress: "string",
      numberOfCollaborators: 10,
      collaborators: [{ name: "string", surname: "string", id: 0, photoAddress: "string" }],
      leaderInfo: "string",
      leaderId: 0,
    };
  }
}

export class ProjectCount {
  all!: number;
  my!: number;
}
