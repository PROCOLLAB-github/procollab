/** @format */

import { TestBed } from "@angular/core/testing";
import { CourseDetailUIInfoService } from "./course-detail-ui-info.service";
import { SeenModulesStoragePort } from "@domain/courses/ports/seen-modules-storage.port";
import { CourseModule, CourseStructure } from "@domain/courses/courses.model";

/**
 * In-memory реализация порта — тест не знает про localStorage.
 * Используется вместо LocalStorageSeenModulesAdapter.
 */
class InMemorySeenModulesAdapter implements SeenModulesStoragePort {
  private readonly seen = new Set<string>();

  isSeen(courseId: number, moduleId: number): boolean {
    return this.seen.has(`${courseId}:${moduleId}`);
  }

  markSeen(courseId: number, moduleId: number): void {
    this.seen.add(`${courseId}:${moduleId}`);
  }
}

function buildModule(id: number, status: CourseModule["progressStatus"]): CourseModule {
  return {
    id,
    courseId: 1,
    title: "",
    order: id,
    avatarUrl: "",
    startDate: new Date(),
    status: "",
    isAvailable: true,
    progressStatus: status,
    percent: 0,
    lessons: [],
  };
}

function buildStructure(courseId: number, modules: CourseModule[]): CourseStructure {
  return { courseId, progressStatus: "in_progress", percent: 0, modules };
}

describe("CourseDetailUIInfoService.applyCourseData", () => {
  let service: CourseDetailUIInfoService;
  let storage: InMemorySeenModulesAdapter;

  beforeEach(() => {
    storage = new InMemorySeenModulesAdapter();

    TestBed.configureTestingModule({
      providers: [
        CourseDetailUIInfoService,
        { provide: SeenModulesStoragePort, useValue: storage },
      ],
    });

    service = TestBed.inject(CourseDetailUIInfoService);
  });

  it("не поднимает флаги, если нет завершённых модулей", () => {
    const structure = buildStructure(1, [
      buildModule(1, "in_progress"),
      buildModule(2, "not_started"),
    ]);

    service.applyCourseData(structure);

    expect(service.isCompleteModule()).toBe(false);
    expect(service.isCourseCompleted()).toBe(false);
  });

  it("отмечает модуль просмотренным и поднимает isCompleteModule при новом completed", () => {
    const structure = buildStructure(1, [
      buildModule(1, "completed"),
      buildModule(2, "in_progress"),
    ]);

    service.applyCourseData(structure);

    expect(service.isCompleteModule()).toBe(true);
    expect(service.isCourseCompleted()).toBe(false);
    expect(storage.isSeen(1, 1)).toBe(true);
  });

  it("поднимает isCourseCompleted, если все модули завершены и один ещё не просмотрен", () => {
    const structure = buildStructure(1, [buildModule(1, "completed"), buildModule(2, "completed")]);

    service.applyCourseData(structure);

    expect(service.isCompleteModule()).toBe(true);
    expect(service.isCourseCompleted()).toBe(true);
  });

  it("не срабатывает повторно, если все завершённые модули уже просмотрены", () => {
    storage.markSeen(1, 1);
    storage.markSeen(1, 2);
    const structure = buildStructure(1, [buildModule(1, "completed"), buildModule(2, "completed")]);

    service.applyCourseData(structure);

    expect(service.isCompleteModule()).toBe(false);
    expect(service.isCourseCompleted()).toBe(false);
  });

  it("хранит отметки независимо для разных курсов", () => {
    storage.markSeen(1, 1);

    service.applyCourseData(buildStructure(2, [buildModule(1, "completed")]));

    expect(service.isCompleteModule()).toBe(true);
    expect(storage.isSeen(2, 1)).toBe(true);
  });
});
