/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { SpecializationsRepository } from "./specializations.repository";
import { SpecializationsHttpAdapter } from "../../adapters/specializations/specializations-http.adapter";
import { SpecializationsGroup } from "@domain/specializations/specializations-group";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Specialization } from "@domain/specializations/specialization";

describe("SpecializationsRepository", () => {
  let repository: SpecializationsRepository;
  let adapter: jasmine.SpyObj<SpecializationsHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<SpecializationsHttpAdapter>("SpecializationsHttpAdapter", [
      "getSpecializationsNested",
      "getSpecializationsInline",
    ]);
    TestBed.configureTestingModule({
      providers: [
        SpecializationsRepository,
        { provide: SpecializationsHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(SpecializationsRepository);
  }

  it("делегирует getSpecializationsNested в adapter", () => {
    setup();
    adapter.getSpecializationsNested.and.returnValue(of([] as SpecializationsGroup[]));

    repository.getSpecializationsNested().subscribe();

    expect(adapter.getSpecializationsNested).toHaveBeenCalledOnceWith();
  });

  it("делегирует getSpecializationsInline(search, limit, offset) в adapter", () => {
    setup();
    adapter.getSpecializationsInline.and.returnValue(
      of({ count: 0, results: [], next: "", previous: "" } as ApiPagination<Specialization>)
    );

    repository.getSpecializationsInline("dev", 10, 20).subscribe();

    expect(adapter.getSpecializationsInline).toHaveBeenCalledOnceWith("dev", 10, 20);
  });
});
