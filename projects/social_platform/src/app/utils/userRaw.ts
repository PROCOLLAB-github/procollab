/** @format */

import { User, UserInput, UserRaw } from "@domain/auth/user.model";

export function userFromRaw(raw: UserInput): User {
  const user = Object.assign(new User(), raw);

  user.personal = {
    onboardingStage: raw.personal?.onboardingStage ?? raw.onboardingStage!,
    patronymic: raw.personal?.patronymic ?? raw.patronymic!,
    aboutMe: raw.personal?.aboutMe ?? raw.aboutMe!,
    birthday: raw.personal?.birthday ?? raw.birthday!,
    avatar: raw.personal?.avatar ?? raw.avatar!,
    links: raw.personal?.links ?? raw.links ?? [],
    coverImageAddress: raw.personal?.coverImageAddress ?? raw.coverImageAddress,
    speciality: raw.personal?.speciality ?? raw.speciality!,
    userType: raw.personal?.userType ?? raw.userType!,
    city: raw.personal?.city ?? raw.city!,
    phoneNumber: raw.personal?.phoneNumber ?? raw.phoneNumber!,
    region: raw.personal?.region ?? raw.region!,
    isMospolytechStudent: raw.personal?.isMospolytechStudent ?? raw.isMospolytechStudent,
    studyGroup: raw.personal?.studyGroup ?? raw.studyGroup,
    v2Speciality: raw.personal?.v2Speciality ?? raw.v2Speciality!,
  };

  user.roles = {
    member: raw.roles?.member ?? raw.member,
    mentor: raw.roles?.mentor ?? raw.mentor,
    expert: raw.roles?.expert ?? raw.expert,
    investor: raw.roles?.investor ?? raw.investor,
  };

  user.relations = {
    education: raw.relations?.education ?? raw.education ?? [],
    userLanguages: raw.relations?.userLanguages ?? raw.userLanguages ?? [],
    workExperience: raw.relations?.workExperience ?? raw.workExperience ?? [],
    achievements: raw.relations?.achievements ?? raw.achievements ?? [],
    programs: raw.relations?.programs ?? raw.programs ?? [],
    projects: raw.relations?.projects ?? raw.projects ?? [],
    subscribedProjects: raw.relations?.subscribedProjects ?? raw.subscribedProjects ?? [],
    keySkills: raw.relations?.keySkills ?? raw.keySkills ?? [],
    skills: raw.relations?.skills ?? raw.skills ?? [],
    skillsIds: raw.relations?.skillsIds ?? raw.skillsIds ?? [],
    progress: raw.relations?.progress ?? raw.progress,
    isOnline: raw.relations?.isOnline ?? raw.isOnline!,
    isActive: raw.relations?.isActive ?? raw.isActive!,
    timeCreated: raw.relations?.timeCreated ?? raw.timeCreated!,
    timeUpdated: raw.relations?.timeUpdated ?? raw.timeUpdated!,
    verificationDate: raw.relations?.verificationDate ?? raw.verificationDate!,
  };

  user.subscription = {
    isSubscribed: raw.subscription?.isSubscribed ?? raw.isSubscribed!,
    lastSubscribeDate: raw.subscription?.lastSubscribeDate ?? raw.lastSubscribeDate!,
    subscriptionDateOver: raw.subscription?.subscriptionDateOver ?? raw.subscriptionDateOver!,
    lastSubscriptionType: raw.subscription?.lastSubscriptionType ?? raw.lastSubscriptionType!,
    isAutopayAllowed: raw.subscription?.isAutopayAllowed ?? raw.isAutopayAllowed!,
  };

  Object.assign(user, userToRaw(user));

  return user;
}

export function userToRaw(user: UserInput): Partial<UserRaw> {
  const { personal, roles, relations, subscription, ...rest } = user;

  return omitUndefined({
    ...rest,
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,

    patronymic: user.patronymic,
    aboutMe: user.aboutMe,
    birthday: user.birthday,
    avatar: user.avatar,
    links: user.links,
    coverImageAddress: user.coverImageAddress,
    speciality: user.speciality,
    userType: user.userType,
    city: user.city,
    phoneNumber: user.phoneNumber,
    region: user.region,
    isMospolytechStudent: user.isMospolytechStudent,
    studyGroup: user.studyGroup,
    v2Speciality: user.v2Speciality,
    ...personal,

    member: user.member,
    mentor: user.mentor,
    expert: user.expert,
    investor: user.investor,
    ...roles,

    education: user.education,
    userLanguages: user.userLanguages,
    workExperience: user.workExperience,
    achievements: user.achievements,
    programs: user.programs,
    projects: user.projects,
    subscribedProjects: user.subscribedProjects,
    keySkills: user.keySkills,
    skills: user.skills,
    skillsIds: user.skillsIds,
    progress: user.progress,
    isOnline: user.isOnline,
    isActive: user.isActive,
    timeCreated: user.timeCreated,
    timeUpdated: user.timeUpdated,
    verificationDate: user.verificationDate,
    ...relations,

    isSubscribed: user.isSubscribed,
    lastSubscribeDate: user.lastSubscribeDate,
    subscriptionDateOver: user.subscriptionDateOver,
    lastSubscriptionType: user.lastSubscriptionType,
    isAutopayAllowed: user.isAutopayAllowed,
    ...subscription,
  });
}

function omitUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value as T[keyof T];
    }

    return acc;
  }, {} as Partial<T>);
}
