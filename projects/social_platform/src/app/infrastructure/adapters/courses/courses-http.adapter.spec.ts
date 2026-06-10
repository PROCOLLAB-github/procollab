/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { CoursesHttpAdapter } from "./courses-http.adapter";
import {
  CourseCard,
  CourseDetail,
  CourseLesson,
  CourseStructure,
  TaskAnswerResponse,
} from "@domain/courses/courses.model";

describe("CoursesHttpAdapter", () => {
  let adapter: CoursesHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn() };
    TestBed.configureTestingModule({
      providers: [CoursesHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(CoursesHttpAdapter);
  }

  it("getCourses идёт в GET /courses/", () => {
    setup();
    api.get.mockReturnValue(of([] as CourseCard[]));

    adapter.getCourses().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/courses/");
  });

  it("getCourseDetail идёт в GET /courses/:id/", () => {
    setup();
    api.get.mockReturnValue(of({} as CourseDetail));

    adapter.getCourseDetail(5).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/courses/5/");
  });

  it("getCourseStructure идёт в GET /courses/:id/structure/", () => {
    setup();
    api.get.mockReturnValue(of({} as CourseStructure));

    adapter.getCourseStructure(5).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/courses/5/structure/");
  });

  it("getCourseLesson идёт в GET /courses/lessons/:id/", () => {
    setup();
    api.get.mockReturnValue(of({} as CourseLesson));

    adapter.getCourseLesson(9).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/courses/lessons/9/");
  });

  it("postAnswerQuestion идёт в POST /courses/tasks/:id/answer/ с body", () => {
    setup();
    api.post.mockReturnValue(of({} as TaskAnswerResponse));

    adapter.postAnswerQuestion(3, "text", [1, 2], [7]).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/courses/tasks/3/answer/", {
      answerText: "text",
      optionIds: [1, 2],
      fileIds: [7],
    });
  });
});
