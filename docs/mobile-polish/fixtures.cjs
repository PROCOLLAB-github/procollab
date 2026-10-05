/** @format */

const fixtures = require("../responsive/fixtures.cjs");
fixtures.user.firstName = "Алексей";
fixtures.user.lastName = "Куделько";
fixtures.project.name = "Городские проекты";
fixtures.project.shortDescription = "Сервис для студенческих команд";
fixtures.project.region = "Ростовская область";
fixtures.project.partnerProgram = {
  id: 1,
  programId: 1,
  programLinkId: 1,
  name: "Акселератор студенческих проектов",
  isSubmitted: false,
  canSubmit: true,
  programFields: [],
  programFieldValues: [],
};
fixtures.program.name = "Кейс-чемпионат студенческих проектов";
fixtures.vacancy.role = "Дизайнер интерфейсов";
fixtures.vacancy.description = "Помогите создавать понятные интерфейсы для студенческих команд.";
fixtures.vacancy.requiredSkills = [
  "Мотивированность",
  "Глубинное интервью",
  "Проектирование пользовательского опыта",
  "Figma",
].map((name, id) => ({ id: id + 1, name, category: { id: 1, name: "Soft skills" }, approves: [] }));
const response = fixtures.response;
fixtures.response = (pathname, method, query, state) =>
  /\/feed\/$/.test(pathname)
    ? {
        count: 1,
        next: null,
        previous: null,
        counts: { all: 88, project: 56, vacancy: 1, news: 31, partnerprogram: 0, education: 0 },
        results: [
          { typeModel: "vacancy", content: fixtures.vacancy, publishedAt: "2026-09-29T12:00:00Z" },
        ],
      }
    : response(pathname, method, query, state);
module.exports = fixtures;
