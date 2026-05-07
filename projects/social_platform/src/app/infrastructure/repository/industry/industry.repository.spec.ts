/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { IndustryRepository } from "./industry.repository";
import { IndustryHttpAdapter } from "../../adapters/industry/industry-http.adapter";
import { Industry } from "@domain/industry/industry.model";

describe("IndustryRepository", () => {
  let repository: IndustryRepository;
  let adapter: jasmine.SpyObj<IndustryHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<IndustryHttpAdapter>("IndustryHttpAdapter", ["fetchAll"]);
    TestBed.configureTestingModule({
      providers: [IndustryRepository, { provide: IndustryHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(IndustryRepository);
  }

  it("getAll делегирует в adapter.fetchAll и обновляет сигнал industries", done => {
    setup();
    const raw = [
      { id: 1, name: "IT" },
      { id: 2, name: "Finance" },
    ];
    adapter.fetchAll.and.returnValue(of(raw as unknown as Industry[]));

    repository.getAll().subscribe(industries => {
      expect(adapter.fetchAll).toHaveBeenCalledOnceWith();
      expect(industries.length).toBe(2);
      expect(industries[0]).toBeInstanceOf(Industry);
      expect(repository.industries()).toEqual(industries);
      done();
    });
  });

  it("getOne возвращает отрасль из кеша по id", done => {
    setup();
    const raw = [
      { id: 1, name: "IT" },
      { id: 2, name: "Finance" },
    ];
    adapter.fetchAll.and.returnValue(of(raw as unknown as Industry[]));

    repository.getAll().subscribe(() => {
      const result = repository.getOne(2);
      expect(result?.id).toBe(2);
      done();
    });
  });

  it("getOne возвращает undefined, если отрасли в кеше нет", () => {
    setup();
    expect(repository.getOne(999)).toBeUndefined();
  });
});
