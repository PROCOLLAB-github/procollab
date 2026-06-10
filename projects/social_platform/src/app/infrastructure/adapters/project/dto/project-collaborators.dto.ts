/** @format */

export interface CollaboratorDto {
  userId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
  skills: { id: number; name: string; category: { id: number; name: string } }[];
}
