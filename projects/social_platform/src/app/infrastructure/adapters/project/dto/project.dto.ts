/**
 * DTO — контракт с API для проектов.
 * Поля в camelCase — camelcase interceptor уже преобразует snake_case ответы бэка.
 *
 * Отличия от domain-модели Project:
 * - только то что реально приходит с API, без вычисляемых полей и методов
 * - вложенные объекты описаны через отдельные DTO-интерфейсы
 *
 * @format
 */

import { CollaboratorDto } from "./project-collaborators.dto";
import { PartnerDto } from "./project-partners.dto";
import { ResourceDto } from "./project-resources.dto";
import { VacancyDto } from "./project-vacancy.dto";
import { PartnerProgramInfoDto } from "./project-program.dto";
import { GoalDto } from "./project-goal.dto";

export interface ProjectDto {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  targetAudience: string;
  problem: string;
  actuality: string;
  region: string;
  trl: string;
  implementationDeadline: string;
  industry: number;
  draft: boolean;
  leader: number;
  leaderInfo?: { firstName: string; lastName: string };
  imageAddress: string;
  presentationAddress: string;
  cover: string | null;
  coverImageAddress: string | null;
  links: string[];
  numberOfCollaborators: number;
  viewsCount: number;
  isCompany: boolean;
  inviteId: number;
  achievements: { id: number; title: string; status: string }[];
  collaborators: CollaboratorDto[];
  collaborator?: CollaboratorDto;
  vacancies: VacancyDto[];
  partners: PartnerDto[];
  resources: ResourceDto[];
  goals: GoalDto[];
  partnerProgram: PartnerProgramInfoDto | null;
  partnerProgramsTags?: string[];
}

export interface ProjectCountDto {
  all: number;
  my: number;
  subs: number;
}

export interface ProjectListDto {
  count: number;
  results: ProjectDto[];
  next: string;
  previous: string;
}
