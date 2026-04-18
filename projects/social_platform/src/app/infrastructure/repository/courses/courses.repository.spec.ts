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
  let adapter: jasmine.SpyObj<CoursesHttpAdapter>;
  let eventBus: EventBus;

  function setup(): void {
    adapter = jasmine.createSpyObj<CoursesHttpAdapter>("CoursesHttpAdapter", [
      "getCourses",
      "getCourseDetail",
      "getCourseStructure",
      "getCourseLesson",
      "postAnswerQuestion",
    ]);
    TestBed.configureTestingModule({
      providers: [CoursesRepository, { provide: CoursesHttpAdapter, useValue: adapter }],
    });
    eventBus = TestBed.inject(EventBus);
    spyOn(eventBus, "emit");
    repository = TestBed.inject(CoursesRepository);
  }

  it("getCourses делегирует в adapter", () => {
    setup();
    adapter.getCourses.and.returnValue(of([] as CourseCard[]));
    repository.getCourses().subscribe();
    expect(adapter.getCourses).toHaveBeenCalledOnceWith();
  });

  it("getCourseDetail кеширует результат", () => {
    setup();
    adapter.getCourseDetail.and.returnValue(of({ id: 1 } as CourseDetail));
    repository.getCourseDetail(1).subscribe();
    repository.getCourseDetail(1).subscribe();
    expect(adapter.getCourseDetail).toHaveBeenCalledTimes(1);
  });

  it("getCourseStructure кеширует результат", () => {
    setup();
    adapter.getCourseStructure.and.returnValue(of({ id: 1 } as unknown as CourseStructure));
    repository.getCourseStructure(1).subscribe();
    repository.getCourseStructure(1).subscribe();
    expect(adapter.getCourseStructure).toHaveBeenCalledTimes(1);
  });

  it("getCourseLesson делегирует в adapter", () => {
    setup();
    adapter.getCourseLesson.and.returnValue(of({} as CourseLesson));
    repository.getCourseLesson(5).subscribe();
    expect(adapter.getCourseLesson).toHaveBeenCalledOnceWith(5);
  });

  it("postAnswerQuestion эмитит TaskAnswerSubmitted и очищает structure-кеш", () => {
    setup();
    const response = {} as TaskAnswerResponse;
    adapter.postAnswerQuestion.and.returnValue(of(response));
    adapter.getCourseStructure.and.returnValue(of({ id: 1 } as unknown as CourseStructure));
    repository.getCourseStructure(1).subscribe();

    repository.postAnswerQuestion(10, "answer", [1], [2]).subscribe();

    expect(adapter.postAnswerQuestion).toHaveBeenCalledOnceWith(10, "answer", [1], [2]);
    expect(eventBus.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: "TaskAnswerSubmitted" })
    );
    // после clear() кеш структуры должен повторно бить adapter
    repository.getCourseStructure(1).subscribe();
    expect(adapter.getCourseStructure).toHaveBeenCalledTimes(2);
  });
});
