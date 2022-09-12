/** @format */

export class Invite {
  id!: number;
  createdAt!: string;
  updatedAt!: string;
  project!: {
    id: number;
    photoAddress: string;
    name: string;
  };

  inviterProfile!: {
    id: number;
    photoAddress: string;
    name: string;
    surname: string;
  };
}
