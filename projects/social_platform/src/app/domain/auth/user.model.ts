/** @format */

import { FileModel } from "../file/file.model";
import { Program } from "../program/program.model";
import { Project } from "../project/project.model";
import { Skill } from "../skills/skill.model";

/**
 * Модели данных пользователя и связанных сущностей
 *
 * Назначение: Определяет типы данных для пользователя, достижений, образования и опыта работы
 * Принимает: Не принимает параметров (классы моделей)
 * Возвращает: Типизированные объекты для работы с данными пользователя
 *
 * Функциональность:
 * - Класс User: основная модель пользователя с профилем, навыками, проектами
 * - Класс Achievement: модель достижений пользователя
 * - Класс Education: модель образования пользователя
 * - Класс workExperience: модель опыта работы
 * - Класс userLanguages: модель языков пользователя
 * - Класс UserRole: модель ролей пользователя
 * - Методы для проверки завершенности профиля и создания тестовых данных
 */
export class Achievement {
  id!: number;
  title!: string;
  status!: string;
  year!: number;
  files!: string[] | FileModel[];
}

export class Education {
  organizationName!: string;
  entryYear!: number;
  completionYear!: number;
  description!: string;
  educationStatus!: string;
  educationLevel!: string;
}

export class WorkExperience {
  organizationName!: string;
  entryYear!: number;
  completionYear!: number;
  description!: string;
  jobPosition!: string;
}

export class UserLanguages {
  language!: string;
  languageLevel!: string;
}

export class UserRolesData {
  member?: {
    usefulToProject: string;
  };

  mentor?: {
    usefulToProject: string;
    preferredIndustries: string[];
  };

  expert?: {
    usefulToProject: string;
    preferredIndustries: string[];
  };

  investor?: {
    preferredIndustries: string[];
  };
}

export class UserSubscription {
  isSubscribed!: boolean;
  lastSubscribeDate!: string;
  subscriptionDateOver!: string | null;
  lastSubscriptionType!: string | null;
  isAutopayAllowed!: boolean;
}

export class UserRelations {
  education!: Education[];
  userLanguages!: UserLanguages[];
  workExperience!: WorkExperience[];
  achievements!: Achievement[];
  programs!: Program[];
  projects!: Project[];
  subscribedProjects!: Project[];
  keySkills!: string[];
  skills!: Skill[];
  skillsIds!: number[];
  progress?: number;
  isOnline!: boolean;
  isActive!: boolean;
  timeCreated!: string;
  timeUpdated!: string;
  verificationDate!: string;
}

export class UserPersonal {
  onboardingStage!: number | null;
  patronymic!: string;
  aboutMe!: string;
  birthday!: string;
  avatar!: string;
  links!: string[];
  coverImageAddress?: string;
  speciality!: string;
  userType!: number;
  city!: string;
  phoneNumber!: string;
  region!: string;
  isMospolytechStudent?: boolean;
  studyGroup?: string;

  v2Speciality!: {
    id: number;
    name: string;
  };
}

export type UserRaw = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
} & UserPersonal &
  UserRolesData &
  UserRelations &
  UserSubscription;

export type UserInput = Partial<UserRaw> & {
  personal?: Partial<UserPersonal>;
  roles?: Partial<UserRolesData>;
  relations?: Partial<UserRelations>;
  subscription?: Partial<UserSubscription>;
};

export class User {
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;

  personal!: UserPersonal;
  roles!: UserRolesData;
  relations!: UserRelations;

  subscription!: UserSubscription;

  doesCompleted(): boolean {
    return this.personal.onboardingStage === null;
  }
}

export class UserRole {
  id!: number;
  name!: string;
}
