/** @format */
// Entirely synthetic API data. Never forwards a mutation to a live service.
const long = "ОченьДлинноеНазваниеБезПробелов".repeat(4);
const skill = { id: 1, name: long, category: { id: 1, name: "Hard skills" }, approves: [] };
const collaborator = {
  userId: 1,
  firstName: long,
  lastName: "Тестовый",
  avatar: "",
  role: "Руководитель",
  skills: [skill],
};
const project = {
  id: 1,
  name: long,
  description: long,
  shortDescription: "Проект для проверки адаптива",
  targetAudience: long,
  problem: long,
  actuality: long,
  region: "Москва",
  trl: "1",
  implementationDeadline: "2027-01-01",
  industry: 1,
  draft: false,
  leader: 1,
  leaderInfo: collaborator,
  imageAddress: "/assets/images/profile/main.svg",
  presentationAddress: "",
  cover: null,
  coverImageAddress: null,
  isDefaultCover: true,
  links: ["https://example.test/" + "long".repeat(30)],
  numberOfCollaborators: 1,
  viewsCount: 0,
  isCompany: false,
  inviteId: 1,
  achievements: [],
  collaborators: [collaborator],
  vacancies: [],
  partners: [],
  resources: [],
  goals: [],
  partnerProgram: null,
  partnerProgramsTags: [],
};
const user = {
  id: 1,
  email: "long.email.for.responsive.testing@example.test",
  firstName: long,
  lastName: "Тестовый",
  patronymic: "",
  aboutMe: long,
  birthday: "2000-01-01",
  avatar: "",
  speciality: "Разработчик",
  userType: 1,
  city: "Москва",
  region: "Москва",
  phoneNumber: "+79990000000",
  v2Speciality: { id: 1, name: "Разработчик" },
  links: [],
  onboardingStage: null,
  education: [],
  userLanguages: [],
  workExperience: [],
  achievements: [],
  programs: [],
  projects: [project],
  subscribedProjects: [],
  keySkills: [long],
  skills: [skill],
  skillsIds: [1],
  progress: 100,
  isOnline: false,
  isActive: true,
  timeCreated: "2026-10-01",
  timeUpdated: "2026-10-01",
  verificationDate: "2026-10-01",
  verificationNoticeAcknowledgedAt: "2026-10-01",
  profileFillPromptAcknowledgedAt: "2026-10-01",
  isSubscribed: false,
  lastSubscribeDate: "",
  subscriptionDateOver: null,
  lastSubscriptionType: null,
  isAutopayAllowed: false,
};
const program = {
  id: 1,
  name: long,
  description: long,
  shortDescription: "Тестовое мероприятие",
  city: "Москва",
  tag: "Хакатон",
  year: 2026,
  links: [],
  materials: [],
  registrationLink: null,
  imageAddress: "/assets/images/profile/main.svg",
  coverImageAddress: "",
  presentationAddress: "",
  advertisementImageAddress: "",
  datetimeRegistrationEnds: "2027-01-01",
  datetimeStarted: "2026-10-01",
  datetimeFinished: "2027-01-01",
  datetimeProjectSubmissionEnds: "2027-01-01",
  datetimeEvaluationEnds: "2027-01-01",
  viewsCount: 1,
  likesCount: 0,
  isUserLiked: false,
  isUserManager: true,
  isUserExpert: true,
  isUserMember: true,
  currentApplication: null,
  welcomeAcknowledgedAt: "2026-10-01",
  publishProjectsAfterFinish: true,
  courseId: 1,
  courses: [],
};
const vacancy = {
  id: 1,
  role: long,
  project: { id: 1, name: long, imageAddress: "", links: [] },
  isActive: true,
  requiredSkills: [skill],
  description: long,
  salary: "100000",
  city: "Москва",
  workFormat: "удаленная работа",
  requiredExperience: "без опыта",
  workSchedule: "гибкий график",
  specialization: "Разработчик",
  canRespond: true,
  canManageResponses: true,
  datetimeCreated: "2026-10-01",
};
const course = {
  id: 1,
  title: long,
  description: long,
  accessType: "all_users",
  status: "published",
  avatarUrl: "",
  headerCoverUrl: "",
  cardCoverUrl: "",
  startDate: "2026-01-01",
  endDate: "2027-01-01",
  dateLabel: "01.01.2026 — 01.01.2027",
  isAvailable: true,
  partnerProgramId: 1,
  progressStatus: "in_progress",
  percent: 10,
  actionState: "continue",
  analyticsStub: null,
};
const lesson = {
  id: 1,
  moduleId: 1,
  courseId: 1,
  title: long,
  progressStatus: "in_progress",
  percent: 10,
  currentTaskId: 1,
  moduleOrder: 1,
  tasks: [
    {
      id: 1,
      order: 1,
      title: long,
      answerTitle: "Ответ",
      status: "published",
      taskKind: "question",
      checkType: "auto",
      informationalType: null,
      questionType: "text",
      answerType: "text",
      bodyText: long,
      videoUrl: null,
      imageUrl: null,
      attachmentUrl: null,
      isAvailable: true,
      isCompleted: false,
      options: [],
    },
  ],
};
const structure = {
  courseId: 1,
  progressStatus: "in_progress",
  percent: 10,
  modules: [
    {
      id: 1,
      courseId: 1,
      title: long,
      order: 1,
      avatarUrl: "",
      startDate: "2026-01-01",
      status: "published",
      isAvailable: true,
      progressStatus: "in_progress",
      percent: 10,
      lessons: [{ ...lesson, order: 1, status: "published", isAvailable: true, taskCount: 1 }],
    },
  ],
};
const page = results => ({ count: results.length, results, next: null, previous: null });
const fields = [
  {
    id: 1,
    name: "note",
    label: "Описание решения",
    fieldType: "text",
    options: [],
    isRequired: false,
    helpText: long,
    value: long,
  },
  {
    id: 2,
    name: "track",
    label: "Направление",
    fieldType: "select",
    options: [long, "Разработка"],
    isRequired: false,
    helpText: "Выберите направление",
    value: "Разработка",
  },
];
const linkFields = {
  programLinkId: 1,
  programId: 1,
  projectId: 1,
  submitted: false,
  isCompetitive: true,
  submissionOpen: true,
  submissionDeadline: "2027-01-01",
  canSubmit: true,
  fields,
};
const ratedProject = {
  ...project,
  scored: false,
  scoredExpertId: null,
  ratedExperts: [],
  ratedCount: 0,
  maxRates: 3,
  criterias: [
    {
      id: 1,
      name: "Качество решения",
      description: long,
      type: "int",
      minValue: 0,
      maxValue: 10,
      value: null,
      expertId: null,
    },
    {
      id: 2,
      name: "Соответствие требованиям",
      description: long,
      type: "bool",
      value: null,
      expertId: null,
    },
    { id: 3, name: "Комментарий", description: long, type: "str", value: null, expertId: null },
  ],
};
const vacancyResponse = {
  id: 1,
  vacancy,
  user,
  isApproved: null,
  status: "pending",
  datetimeCreated: "2026-10-01",
  whyMe: long,
  accompanyingFile: null,
};
const participant = { ...user, id: 2, firstName: "Кандидат", lastName: long };
user.avatar = "/assets/images/projects/shared/idea.svg";
collaborator.avatar = user.avatar;
project.imageAddress = user.avatar;
project.coverImageAddress = "/assets/images/auth/login-img.png";
program.imageAddress = user.avatar;
const news = {
  id: 1,
  name: "Новости программы",
  imageAddress: user.avatar,
  title: long,
  text: long,
  description: long,
  datetimeCreated: "2026-10-01",
  timeCreated: "2026-10-01",
  project: 1,
  author: 1,
  files: [],
  images: [],
  likesCount: 0,
  isUserLiked: false,
};
const total = { total: 1 };
const regions = { total: 1, items: [{ name: long, count: 1 }] };
const metrics = { participantsTotal: 1, projectsTotal: 1, notSubmitted: 0, submitted: 1 };
const overview = {
  summary: {
    participants: total,
    projects: total,
    experts: total,
    regions,
    participantRegions: regions,
  },
  participantFunnel: {
    registrations: 1,
    uniqueParticipants: 1,
    withTeam: 1,
    projectCreators: 1,
    submittedProjectCreators: 1,
  },
  solutionFunnel: { created: 1, notSubmitted: 0, submitted: 1, evaluated: 0 },
  evaluationStatus: {
    mode: "open",
    maxEvaluationsPerProject: null,
    assignments: { total: 1, pending: 1, evaluated: 0 },
    projects: { submitted: 1, awaitingEvaluation: 1, partiallyEvaluated: 0, evaluated: 0 },
  },
  attention: {
    participantsWithoutTeam: 0,
    projectsAwaitingEvaluation: 1,
    projectsNotSubmitted: { applicable: true, total: 0 },
    delayedExperts: { applicable: false, total: 0, items: [], thresholdHours: 24 },
  },
  activity: [],
  cases: {
    configured: true,
    submissionApplicable: true,
    items: [{ name: long, ...metrics }],
    withoutCase: { participantsTotal: 0, projectsTotal: 0, notSubmitted: 0, submitted: 0 },
  },
};
function response(path, method = "GET", query = new URLSearchParams(), state = {}) {
  const assignment = {
    assignmentId: 1,
    expert: {
      expertId: 1,
      userId: 1,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: long,
      avatar: user.avatar,
    },
    project: { id: 1, name: long },
    status: "completed",
    assignedAt: "2026-10-01",
    projectSubmitted: true,
    projectSubmittedAt: "2026-10-01",
    waitingSince: null,
    waitingSeconds: null,
  };
  if (/\/manager-overview\/assignments\/1\/scores\//.test(path))
    return {
      ...assignment,
      scores: [
        {
          criterionId: 1,
          name: long,
          description: long,
          type: "int",
          minValue: 0,
          maxValue: 10,
          value: "8",
          isScored: true,
        },
      ],
    };
  if (/\/manager-overview\/assignments\//.test(path)) return [assignment];
  if (/\/manager-overview\/projects-awaiting-evaluation\//.test(path))
    return {
      ...page([
        {
          programProjectId: 1,
          project: { id: 1, name: long },
          leader: { userId: 1, fullName: long, avatar: user.avatar },
          submittedAt: "2026-10-01",
          status: "partially_evaluated",
          reason: "partially_evaluated",
          reasonLabel: "Частично оценено",
          assignmentsTotal: 1,
          assignmentsCompleted: 0,
        },
      ]),
      mode: "open",
    };
  if (/\/programs\/1\/projects\//.test(path) && query.get("view") === "case_analytics")
    return {
      ...page([
        {
          programProjectId: 1,
          project: { id: 1, name: long, region: "Москва", presentationAddress: null },
          case: { kind: "selected", name: long },
          leader: { userId: 1, fullName: long },
          teamSize: 1,
          linkedAt: "2026-10-01",
          submitted: true,
          submittedAt: "2026-10-01",
        },
      ]),
      selection: { scope: "selected", caseName: long },
      casesConfigured: true,
      submissionApplicable: true,
      caseMetrics: metrics,
    };
  if (/\/invites\/$/.test(path))
    return method === "GET"
      ? []
      : {
          id: 1,
          user: participant,
          project,
          role: "Разработчик",
          isAccepted: null,
          datetimeCreated: "2026-10-01",
        };
  if (/\/vacancies\/responses\/1\/(accept|decline)\//.test(path))
    return { ...vacancyResponse, isApproved: path.includes("accept") };
  if (/\/files\/$/.test(path))
    return { url: "https://example.test/ОченьДлинноеНазваниеФайлаДляПроверкиАдаптива.pdf" };
  if (/\/courses\/tasks\/1\/answer\/$/.test(path))
    return {
      answerId: 1,
      status: "submitted",
      isCorrect: true,
      canContinue: true,
      nextTaskId: null,
      submittedAt: "2026-10-01",
    };
  if (/\/rate-project\/rate\/1/.test(path))
    return { ...ratedProject, scored: true, scoredExpertId: 1 };
  if (/\/rate-project\/1/.test(path)) return page([ratedProject]);
  if (/\/programs\/1\/projects\/apply\/$/.test(path))
    return method === "GET"
      ? { programId: 1, canSubmit: true, submissionDeadline: "2027-01-01", programFields: fields }
      : { projectId: 1, programLinkId: 1 };
  if (/\/programs\/partner-program-projects\/1\/fields\//.test(path)) return linkFields;
  if (/\/programs\/partner-program-projects\/1\/submit\//.test(path))
    return { ...project, submitted: true };
  if (/\/projects\/1\/responses\//.test(path)) return [vacancyResponse];
  if (/\/vacancies\/1\/responses\//.test(path))
    return method === "GET" ? [vacancyResponse] : vacancyResponse;
  if (/\/api\/token\//.test(path))
    return { access: "responsive-fixture", refresh: "responsive-fixture" };
  if (/\/auth\/users\/(current|1)\/$/.test(path)) return user;
  if (/\/auth\/users\/(types|roles)\//.test(path))
    return [
      [1, "Участник"],
      [2, "Эксперт"],
      [3, "Менеджер"],
    ];
  if (/\/auth\/users\/projects/.test(path)) return page([project]);
  if (/\/auth\/users\/1\/subscribed_projects\//.test(path)) return page([project]);
  if (/\/auth\/public-users\/stats/.test(path))
    return { total: 1, cities: 1, regions: 1, students: 1, skills: 1, userTypes: [] };
  if (/\/auth\/public-users\/$/.test(path)) return page([participant]);
  if (/\/auth\/public-users\/1\/$/.test(path)) return user;
  if (/\/industries\//.test(path)) return [{ id: 1, name: "Информационные технологии" }];
  if (/\/core\/skills\/inline/.test(path)) return page([skill]);
  if (/\/core\/skills\/nested/.test(path)) return [{ id: 1, name: "Hard skills", skills: [skill] }];
  if (/specializations/.test(path)) return [{ id: 1, name: "Разработчик" }];
  if (/\/projects\/count\//.test(path))
    return { all: 1, my: 1, subs: 1, myLeader: 1, myInProgram: 0, mySubmitted: 0 };
  if (/\/projects\/1\/$/.test(path)) return project;
  if (/\/projects\/$/.test(path)) return method === "GET" ? page([project]) : project;
  if (/\/programs\/1\/manager-overview\/$/.test(path)) return overview;
  if (/\/programs\/1\/$/.test(path)) return program;
  if (/\/programs\/1\/analytics-widget\/$/.test(path))
    return {
      programId: 1,
      isCompetitive: true,
      role: "organizer",
      organizer: {
        participants: 1,
        projects: 1,
        submittedSolutions: 0,
        participantsWithoutProject: 0,
      },
    };
  if (/\/programs\/$/.test(path)) return page([program]);
  if (/\/programs\/1\/projects\//.test(path)) return page([project]);
  if (/\/programs\/1\/filters\//.test(path)) return [];
  if (/\/vacancies\/responses\/self/.test(path)) return page([vacancyResponse]);
  if (/\/vacancies\/1\/$/.test(path)) return vacancy;
  if (/\/vacancies\/$/.test(path)) return page([vacancy]);
  if (/\/courses\/lessons\/1\/$/.test(path))
    return state.completedLesson
      ? {
          ...lesson,
          progressStatus: "completed",
          percent: 100,
          currentTaskId: null,
          tasks: lesson.tasks.map(task => ({ ...task, isCompleted: true })),
        }
      : lesson;
  if (/\/courses\/1\/structure\/$/.test(path)) return structure;
  if (/\/courses\/1\/$/.test(path)) return course;
  if (/\/courses\/$/.test(path)) return [course];
  if (/\/schema\//.test(path)) return { dataSchema: {} };
  if (/\/news\/1\/$/.test(path)) return news;
  if (/\/news\//.test(path)) return page([news]);
  if (/\/feed\//.test(path)) return page([]);
  if (method !== "GET") return { ...project, ...user, id: 1 };
  return [];
}
module.exports = { response, project, program, user, vacancy, overview, lesson, long };

// Production Angular использует project-analytics; payload совпадает с overview fixtures.
const originalProductionResponse = module.exports.response;
module.exports.response = (pathname, method, query, state) =>
  /\/programs\/1\/project-analytics\/$/.test(pathname)
    ? module.exports.overview
    : originalProductionResponse(pathname, method, query, state);
