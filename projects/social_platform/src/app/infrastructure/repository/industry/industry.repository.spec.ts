/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { IndustryRepository } from "./industry.repository";
import { IndustryHttpAdapter } from "../../adapters/industry/industry-http.adapter";
import { Industry } from "@domain/industry/industry.model";

describe("IndustryRepository", () => {
  let repository: IndustryRepository;
  let adapter: any;

  function setup(): void {
    adapter = { fetchAll: vi.fn() };
    TestBed.configureTestingModule({
      providers: [IndustryRepository, { provide: IndustryHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(IndustryRepository);
  }

  it("getAll делегирует в adapter.fetchAll и обновляет сигнал industries", () =>
    new Promise<void>(done => {
      setup();
      const raw = [
        { id: 1, name: "IT" },
        { id: 2, name: "Finance" },
      ];
      adapter.fetchAll.mockReturnValue(of(raw as unknown as Industry[]));

      repository.getAll().subscribe(industries => {
        expect(adapter.fetchAll).toHaveBeenCalledExactlyOnceWith();
        expect(industries.length).toBe(2);
        expect(industries[0]).toBeInstanceOf(Industry);
        expect(repository.industries()).toEqual(industries);
        done();
      });
    }));

  it("getOne возвращает отрасль из кеша по id", () =>
    new Promise<void>(done => {
      setup();
      const raw = [
        { id: 1, name: "IT" },
        { id: 2, name: "Finance" },
      ];
      adapter.fetchAll.mockReturnValue(of(raw as unknown as Industry[]));

      repository.getAll().subscribe(() => {
        const result = repository.getOne(2);
        expect(result?.id).toBe(2);
        done();
      });
    }));

  it("getOne возвращает undefined, если отрасли в кеше нет", () => {
    setup();
    expect(repository.getOne(999)).toBeUndefined();
  });
});
