/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { VacancyRepository } from "./vacancy.repository";
import { VacancyHttpAdapter } from "../../adapters/vacancy/vacancy-http.adapter";
import { EventBus } from "@domain/shared/event-bus";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { CreateVacancyDto } from "@api/project/dto/create-vacancy.model";
import { vacancyCreated } from "@domain/vacancy/events/vacancy-created.event";
import { vacancyUpdated } from "@domain/vacancy/events/vacancy-updated.event";
import { vacancyDelete } from "@domain/vacancy/events/vacancy-deleted.event";

describe("VacancyRepository", () => {
  let repository: VacancyRepository;
  let adapter: jasmine.SpyObj<VacancyHttpAdapter>;
  let eventBus: EventBus;

  function setup(): void {
    adapter = jasmine.createSpyObj<VacancyHttpAdapter>("VacancyHttpAdapter", [
      "getForProject",
      "getMyVacancies",
      "getOne",
      "postVacancy",
      "updateVacancy",
      "deleteVacancy",
      "sendResponse",
      "responsesByProject",
      "acceptResponse",
      "rejectResponse",
    ]);
    TestBed.configureTestingModule({
      providers: [VacancyRepository, { provide: VacancyHttpAdapter, useValue: adapter }],
    });
    eventBus = TestBed.inject(EventBus);
    repository = TestBed.inject(VacancyRepository);
  }

  it("getForProject делегирует и мапит в Vacancy[]", done => {
    setup();
    adapter.getForProject.and.returnValue(of([{ id: 1 }] as Vacancy[]));

    repository.getForProject(10, 0, 42, "3+", "remote", "full", "100", "js").subscribe(res => {
      expect(adapter.getForProject).toHaveBeenCalledOnceWith(
        10,
        0,
        42,
        "3+",
        "remote",
        "full",
        "100",
        "js"
      );
      expect(res[0]).toBeInstanceOf(Vacancy);
      done();
    });
  });

  it("getMyVacancies мапит в VacancyResponse[]", done => {
    setup();
    adapter.getMyVacancies.and.returnValue(of([{ id: 1 }] as VacancyResponse[]));

    repository.getMyVacancies(10, 0).subscribe(res => {
      expect(adapter.getMyVacancies).toHaveBeenCalledOnceWith(10, 0);
      expect(res[0]).toBeInstanceOf(VacancyResponse);
      done();
    });
  });

  it("getOne кеширует результат", () => {
    setup();
    adapter.getOne.and.returnValue(of({ id: 42 } as Vacancy));

    repository.getOne(42).subscribe();
    repository.getOne(42).subscribe();

    expect(adapter.getOne).toHaveBeenCalledTimes(1);
  });

  it("postVacancy мапит ответ в Vacancy", done => {
    setup();
    const dto = {} as CreateVacancyDto;
    adapter.postVacancy.and.returnValue(of({ id: 1 } as Vacancy));

    repository.postVacancy(42, dto).subscribe(v => {
      expect(adapter.postVacancy).toHaveBeenCalledOnceWith(42, dto);
      expect(v).toBeInstanceOf(Vacancy);
      done();
    });
  });

  it("updateVacancy мапит ответ в Vacancy", done => {
    setup();
    adapter.updateVacancy.and.returnValue(of({ id: 1 } as Vacancy));
    const patch = {} as Partial<Vacancy>;

    repository.updateVacancy(42, patch).subscribe(v => {
      expect(adapter.updateVacancy).toHaveBeenCalledOnceWith(42, patch);
      expect(v).toBeInstanceOf(Vacancy);
      done();
    });
  });

  it("deleteVacancy инвалидирует кеш и делегирует", () => {
    setup();
    adapter.getOne.and.returnValue(of({ id: 7 } as Vacancy));
    adapter.deleteVacancy.and.returnValue(of(undefined));
    repository.getOne(7).subscribe();

    repository.deleteVacancy(7).subscribe();

    repository.getOne(7).subscribe();
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
    expect(adapter.deleteVacancy).toHaveBeenCalledOnceWith(7);
  });

  it("sendResponse мапит в VacancyResponse", done => {
    setup();
    adapter.sendResponse.and.returnValue(of({ id: 1 } as VacancyResponse));
    repository.sendResponse(5, { whyMe: "x" }).subscribe(r => {
      expect(adapter.sendResponse).toHaveBeenCalledOnceWith(5, { whyMe: "x" });
      expect(r).toBeInstanceOf(VacancyResponse);
      done();
    });
  });

  it("responsesByProject мапит в VacancyResponse[]", done => {
    setup();
    adapter.responsesByProject.and.returnValue(of([{ id: 1 }] as VacancyResponse[]));
    repository.responsesByProject(42).subscribe(res => {
      expect(adapter.responsesByProject).toHaveBeenCalledOnceWith(42);
      expect(res[0]).toBeInstanceOf(VacancyResponse);
      done();
    });
  });

  it("acceptResponse/rejectResponse делегируют и мапят", done => {
    setup();
    adapter.acceptResponse.and.returnValue(of({ id: 1 } as VacancyResponse));
    adapter.rejectResponse.and.returnValue(of({ id: 1 } as VacancyResponse));

    repository.acceptResponse(1).subscribe(a => expect(a).toBeInstanceOf(VacancyResponse));
    repository.rejectResponse(1).subscribe(r => {
      expect(r).toBeInstanceOf(VacancyResponse);
      done();
    });
  });

  it("VacancyCreated инвалидирует кеш проекта", () => {
    setup();
    adapter.getOne.and.returnValue(of({ id: 7 } as Vacancy));
    repository.getOne(7).subscribe();

    eventBus.emit(vacancyCreated(7, {} as CreateVacancyDto));

    repository.getOne(7).subscribe();
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
  });

  it("VacancyUpdated инвалидирует кеш вакансии", () => {
    setup();
    adapter.getOne.and.returnValue(of({ id: 7 } as Vacancy));
    repository.getOne(7).subscribe();

    eventBus.emit(vacancyUpdated(7, {} as Partial<Vacancy>));

    repository.getOne(7).subscribe();
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
  });

  it("VacancyDelete инвалидирует кеш вакансии", () => {
    setup();
    adapter.getOne.and.returnValue(of({ id: 7 } as Vacancy));
    repository.getOne(7).subscribe();

    eventBus.emit(vacancyDelete(7));

    repository.getOne(7).subscribe();
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
  });
});
