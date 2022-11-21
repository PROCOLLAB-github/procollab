/** @format */

export class Project {
  id!: number;
  name!: string;
  description!: string;
  shortDescription!: string;
  achievements!: { id: number; title: string; status: string }[];
  industry!: number;
  presentationAddress!: string;
  imageAddress!: string;
  numberOfCollaborators!: number;
  collaborators!: {
    id: number;
    name: string;
    surname: string;
    photoAddress: string;
    speciality: string;
  }[];

  draft!: boolean;
  leader!: number;

  static default(): Project {
    return {
      id: 0,
      name: "string",
      description: "string",
      shortDescription: "string",
      achievements: [{ id: 3, title: "sdf", status: "dsaf" }],
      industry: 0,
      presentationAddress: "string",
      imageAddress: "string",
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
      leader: 0,
    };
  }
}

export class ProjectCount {
  all!: number;
  my!: number;
}
