/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { CoursesRepository } from "./courses.repository";
import { CoursesHttpAdapter } from "../../adapters/courses/courses-http.adapter";
import { EventBus } from "@domain/shared/event-bus";
import {
  CourseCard,
  CourseDetail,
  CourseLesson,
  CourseStructure,
  TaskAnswerResponse,
} from "@domain/courses/courses.model";

describe("CoursesRepository", () => {
  let repository: CoursesRepository;
  let adapter: any;
  let eventBus: EventBus;

  function setup(): void {
    adapter = {
      getCourses: vi.fn(),
      getCourseDetail: vi.fn(),
      getCourseStructure: vi.fn(),
      getCourseLesson: vi.fn(),
      postAnswerQuestion: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [CoursesRepository, { provide: CoursesHttpAdapter, useValue: adapter }],
    });
    eventBus = TestBed.inject(EventBus);
    vi.spyOn(eventBus, "emit");
    repository = TestBed.inject(CoursesRepository);
  }

  it("getCourses делегирует в adapter", () => {
    setup();
    adapter.getCourses.mockReturnValue(of([] as CourseCard[]));
    repository.getCourses().subscribe();
    expect(adapter.getCourses).toHaveBeenCalledExactlyOnceWith();
  });

  it("getCourseDetail кеширует результат", () => {
    setup();
    adapter.getCourseDetail.mockReturnValue(of({ id: 1 } as CourseDetail));
    repository.getCourseDetail(1).subscribe();
    repository.getCourseDetail(1).subscribe();
    expect(adapter.getCourseDetail).toHaveBeenCalledTimes(1);
  });

  it("getCourseStructure кеширует результат", () => {
    setup();
    adapter.getCourseStructure.mockReturnValue(of({ id: 1 } as unknown as CourseStructure));
    repository.getCourseStructure(1).subscribe();
    repository.getCourseStructure(1).subscribe();
    expect(adapter.getCourseStructure).toHaveBeenCalledTimes(1);
  });

  it("getCourseLesson делегирует в adapter", () => {
    setup();
    adapter.getCourseLesson.mockReturnValue(of({} as CourseLesson));
    repository.getCourseLesson(5).subscribe();
    expect(adapter.getCourseLesson).toHaveBeenCalledExactlyOnceWith(5);
  });

  it("postAnswerQuestion эмитит TaskAnswerSubmitted и очищает structure-кеш", () => {
    setup();
    const response = {} as TaskAnswerResponse;
    adapter.postAnswerQuestion.mockReturnValue(of(response));
    adapter.getCourseStructure.mockReturnValue(of({ id: 1 } as unknown as CourseStructure));
    repository.getCourseStructure(1).subscribe();

    repository.postAnswerQuestion(10, "answer", [1], [2]).subscribe();

    expect(adapter.postAnswerQuestion).toHaveBeenCalledExactlyOnceWith(10, "answer", [1], [2]);
    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TaskAnswerSubmitted" }),
    );
    // после clear() кеш структуры должен повторно бить adapter
    repository.getCourseStructure(1).subscribe();
    expect(adapter.getCourseStructure).toHaveBeenCalledTimes(2);
  });
});
