/** @format */
// Изолированные ответы API для визуальной регрессии настоящего Angular-приложения.
// Не подключается к runtime и не обращается к данным внешнего сервера.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { transformSync } = require("esbuild");
const baseline = require("../responsive/fixtures.cjs");
const root = path.resolve(__dirname, "../..");
const contractModule = { exports: {} };
vm.runInNewContext(
  transformSync(
    fs.readFileSync(
      path.join(
        root,
        "projects/social_platform/src/app/domain/solution/solution-contract.fixture.ts",
      ),
      "utf8",
    ),
    { loader: "ts", format: "cjs" },
  ).code,
  { module: contractModule, exports: contractModule.exports },
);
const scenario = name =>
  JSON.parse(
    JSON.stringify(
      contractModule.exports.solutionContractScenarios.find(s => s.name === name).response,
    ),
  );
const legacyResult = ({ application, solutionId, ...result }) => ({
  ...result,
  id: 31,
  projectId: 101,
});
const paged = results => ({
  results,
  count: results.length,
  totalCount: results.length,
  next: null,
  previous: null,
});
const names = ["Иван Петров", "Анна Миронова", "Олег Соколов", "Мария Иванова", "Денис Петров"];
const cases = ["Цифровой сервис", "Операционная эффективность"];
const experts = names.map((name, i) => ({
  id: i < 3 ? 91 + i : `invite:${i}`,
  userId: i < 3 ? 91 + i : undefined,
  invitationId: i < 3 ? undefined : 100 + i,
  name,
  email: `expert${i + 1}@example.test`,
  avatar: null,
  status: ["joined", "joined", "joined", "pending", "expired"][i],
  deliveryStatus: "sent",
  allCases: i === 1,
  caseNames: i === 1 ? [] : [cases[i % 2]],
  assigned: i < 3 ? 2 : null,
  completed: i < 3 ? 1 : null,
  remaining: i < 3 ? 1 : null,
}));
const projects = ["Сервис для студентов", "Чистый маршрут", "Город без отходов"].map((name, i) => ({
  id: 31 + i,
  projectId: 101 + i,
  name,
  leader: { id: 5 + i, name: names[i] },
  submitted: true,
  draft: false,
  evaluationStatus: i ? "awaiting_evaluation" : "partially_evaluated",
  assignmentsTotal: i ? 0 : 2,
  assignmentsCompleted: i ? 0 : 1,
  caseName: cases[i % 2],
  presentationUrl: null,
}));
const roster = () => ({
  revision: "visual-r1",
  requiredEvaluators: 2,
  managedEvaluation: true,
  submittedProjects: 3,
  missingAssignments: 4,
  projectsMissingExperts: 2,
  readyProjects: 0,
  cases,
  experts,
  projects: projects.map((p, i) => ({
    id: p.id,
    name: p.name,
    caseName: p.caseName,
    leaderId: p.leader.id,
    teamUserIds: [p.leader.id],
    experts: i
      ? []
      : [
          {
            expertId: 91,
            name: names[0],
            email: experts[0].email,
            completed: true,
            protected: true,
          },
          {
            expertId: 92,
            name: names[1],
            email: experts[1].email,
            completed: false,
            protected: false,
          },
        ],
  })),
});
const baseProgram = {
  ...baseline.response("/programs/1/", "GET", new URLSearchParams()),
  name: "Кейс-чемпионат PROCOLLAB",
  city: "Москва",
  tag: "Кейс-чемпионат",
  description: "Решения для развития городских сервисов и образования.",
  updatedAt: "2026-10-25T10:00:00Z",
  draft: false,
  isCompetitive: true,
  isDistributedEvaluation: true,
  programFormat: "case_championship",
  datetimeStarted: "2026-10-01T09:00:00Z",
  datetimeRegistrationEnds: "2026-12-01T18:00:00Z",
  datetimeProjectSubmissionEnds: "2026-12-10T18:00:00Z",
  datetimeEvaluationEnds: "2026-12-20T18:00:00Z",
  datetimeFinished: "2026-12-25T18:00:00Z",
  materials: [
    {
      id: 1,
      title: "Положение о программе",
      url: "https://example.test/rules",
      file: null,
      updatedAt: "2026-10-25T10:00:00Z",
    },
  ],
};
const certificate = () => ({
  revision: 1,
  draft: {
    backgroundId: null,
    signatureId: null,
    director: "Иван Петров",
    position: "Руководитель программы",
    showText: true,
    audience: "submitted",
    timing: "manual",
    scheduledAt: null,
    sendEmail: true,
    subject: "Сертификат {program}",
    message: "Здравствуйте, {name}!",
    layout: Object.fromEntries(
      [
        "title",
        "subtitle",
        "name",
        "program",
        "date",
        "number",
        "director",
        "position",
        "signature",
      ].map((key, i) => [key, { x: 10, y: 5 + i * 9, width: 80, height: 8, fontSize: 18 }]),
    ),
  },
  assets: { background: null, signature: null },
  eligibleCounts: { all: 5, submitted: 2 },
  batch: null,
});
const form = () => ({
  updatedAt: baseProgram.updatedAt,
  revision: "visual-r1",
  hasProjects: true,
  cases: cases.map(name => ({ name, projectsCount: 1 })),
  fields: [
    {
      id: 100,
      label: "Краткое описание",
      fieldType: "textarea",
      required: true,
      answersCount: 1,
      editableType: false,
      options: [],
      position: 0,
    },
  ],
  supportedTypes: ["text", "textarea", "select", "file", "number", "checkbox"],
});
const registration = () => ({
  draft: {
    mode: "native",
    fields: [
      {
        id: "f" + "a".repeat(32),
        label: "Вуз или организация",
        type: "text",
        helpText: "",
        required: true,
        source: "own",
        options: [],
        allowOther: false,
      },
    ],
  },
  published: null,
  revision: 2,
  publishedVersion: 0,
  publishedAt: null,
  externalStatus: "not_connected",
  externalUrl: "",
  connectionComment: "",
  connectionWebsiteUrl: "",
  connectionContact: "",
  answeredFieldIds: [],
  link: null,
});
function response(url, method, body) {
  const { pathname: p, searchParams: q } = url;
  const id = Number(p.match(/\/programs\/(\d+)/)?.[1] || 1);
  const program = {
    ...baseProgram,
    id,
    solutionStorageMode: id === 12 ? "solution" : "legacy_project",
  };
  if (p === "/solution-invitations/") return paged([]);
  if (p === "/solution-form-templates/") return scenario("templates");
  if (/\/programs\/\d+\/$/.test(p) || /\/management\/$/.test(p)) return program;
  if (/\/settings\/(basic|dates)\/$/.test(p)) return { ...program, ...body };
  if (/\/management\/participants\/selection\/$/.test(p)) return { ids: [1, 2, 3] };
  if (/\/management\/participants\/$/.test(p)) {
    let rows = names.slice(0, 3).map((name, i) => ({
      id: 1 + i,
      userId: 5 + i,
      name,
      email: `member${i}@example.test`,
      city: "Москва",
      region: "Москва",
      registeredAt: "2026-10-15T10:00:00Z",
      lastActivity: "2026-10-26T10:00:00Z",
      registrationAnswers: [{ label: "Вуз", value: "МГУ" }],
    }));
    if (q.get("search")) rows = rows.filter(r => r.name.includes(q.get("search")));
    return { ...paged(rows), regionOptions: ["Москва", "Санкт-Петербург"] };
  }
  if (/\/management\/projects\/$/.test(p))
    return { ...paged(projects), caseOptions: cases, isCompetitive: true };
  if (/\/management\/projects\/31\/evaluation\/$/.test(p)) {
    const data = scenario("solution_results");
    return {
      projectId: 101,
      programLinkId: 31,
      name: projects[0].name,
      submitted: true,
      canRate: false,
      experts: [],
      criteria: data.criteria,
      result: legacyResult(data.groups[0].solutions[0]),
    };
  }
  if (/\/management\/experts\/$/.test(p)) return roster();
  if (/\/management\/experts\/\d+\/assignments\/$/.test(p))
    return {
      revision: "visual-r1",
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        caseName: p.caseName,
        submitted: true,
        assigned: false,
        protected: false,
        completed: false,
        ownTeam: false,
        eligible: true,
      })),
    };
  if (/\/management\/project-form\/$/.test(p)) return form();
  if (/\/management\/criteria\/$/.test(p))
    return {
      updatedAt: baseProgram.updatedAt,
      revision: "visual-r1",
      locked: false,
      supportedTypes: ["int", "float", "bool", "str"],
      criteria: scenario("solution_results").criteria,
    };
  if (/\/management\/organizers\/$/.test(p))
    return {
      revision: "visual-r1",
      organizerCount: 2,
      activeOrganizerCount: 2,
      invitationCount: 1,
      organizers: [
        {
          id: "member:1",
          userId: 1,
          name: names[0],
          email: "organizer@example.test",
          avatar: null,
          status: "joined",
          active: true,
          isSelf: true,
          canRemove: true,
        },
        {
          id: "member:2",
          userId: 2,
          name: names[1],
          email: "anna@example.test",
          avatar: null,
          status: "joined",
          active: true,
          isSelf: false,
          canRemove: true,
        },
      ],
    };
  if (/\/management\/registration\/$/.test(p)) return registration();
  if (/\/management\/certificates\/$/.test(p)) return certificate();
  if (/\/management\/certificates\/deliveries\/$/.test(p))
    return { ...paged([]), summary: { total: 0, ready: 0, sent: 0, failed: 0 } };
  if (/\/management\/results\/$/.test(p)) {
    const data = scenario("solution_results");
    return {
      ...data,
      programId: 1,
      groups: data.groups.map(g => ({
        caseName: g.caseName,
        projects: g.solutions.map(legacyResult),
      })),
    };
  }
  if (/\/management\/solution-form\/$/.test(p)) return scenario("form_management");
  if (/\/solution-form\/templates\/$/.test(p)) return scenario("templates");
  if (/\/management\/solution-results\/$/.test(p)) return scenario("solution_results");
  if (/\/management\/solution-analytics\/$/.test(p))
    return scenario("manager_solution_analytics_distributed");
  if (/\/solution-analytics\/assignments\/$/.test(p))
    return scenario("manager_solution_assignments_completed");
  if (/\/solution-analytics\/solutions\/$/.test(p)) {
    const source = scenario("manager_solution_list_awaiting").results[0];
    let rows = projects.map((pr, i) => ({
      ...source,
      application: { kind: "solution", programId: 12, solutionId: 301 + i, name: pr.name },
      captain: { userId: pr.leader.id, fullName: pr.leader.name, avatar: null },
      caseName: pr.caseName,
      assignmentsTotal: i ? 0 : 2,
      assignmentsCompleted: i ? 0 : 1,
    }));
    if (q.get("search")) rows = rows.filter(r => r.application.name.includes(q.get("search")));
    if (q.get("case_name")) rows = rows.filter(r => r.caseName === q.get("case_name"));
    return { ...paged(rows), submissionApplicable: true, mode: "distributed" };
  }
  if (/\/solutions\/\d+\/$/.test(p)) return scenario("submitted_snapshot");
  if (/\/solution-allocation\/$/.test(p)) return scenario("solution_allocation_preview");
  if (/\/solutions\/\d+\/admin-changes\/$/.test(p)) return paged([]);
  if (/\/management\/experts\/bulk\/$/.test(p)) return roster();
  if (/\/solution-evaluation\/experts\/\d+\/assignments\/$/.test(p))
    return scenario("solution_assignment_options");
  if (/\/solution-evaluation\/quota\/$/.test(p)) return scenario("solution_quota_preview");
  if (/\/solution-evaluation\/allocation\/$/.test(p))
    return scenario("solution_allocation_preview");
  if (/\/management\/solutions\/\d+\/history\/$/.test(p)) return paged([]);
  if (/\/management\/solutions\/\d+\/case\/preview\/$/.test(p))
    return scenario("case_action_preview_ready");
  if (/\/management\/solutions\/archive\/preview\/$/.test(p))
    return scenario("archive_preview_submitted");
  if (/\/management\/solutions\/actions\/preview\/$/.test(p))
    return scenario("solution_action_preview_ready");
  if (/\/management\/solutions\/\d+\/members\/remove\/preview\/$/.test(p))
    return scenario("member_removal_preview_submitted");
  if (/\/management\/registrations\/remove\/preview\/$/.test(p))
    return scenario("registration_removal_preview_member_submitted");
  return baseline.response(p.replace(/\/programs\/12\//, "/programs/1/"), method, q);
}
module.exports = { response, scenario, roster };
