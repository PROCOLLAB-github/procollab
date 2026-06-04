/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { SpecializationsRepository } from "./specializations.repository";
import { SpecializationsHttpAdapter } from "../../adapters/specializations/specializations-http.adapter";
import { SpecializationsGroup } from "@domain/specializations/specializations-group.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Specialization } from "@domain/specializations/specialization.model";

describe("SpecializationsRepository", () => {
  let repository: SpecializationsRepository;
  let adapter: any;

  function setup(): void {
    adapter = { getSpecializationsNested: vi.fn(), getSpecializationsInline: vi.fn() };
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
    adapter.getSpecializationsNested.mockReturnValue(of([] as SpecializationsGroup[]));

    repository.getSpecializationsNested().subscribe();

    expect(adapter.getSpecializationsNested).toHaveBeenCalledExactlyOnceWith();
  });

  it("делегирует getSpecializationsInline(search, limit, offset) в adapter", () => {
    setup();
    adapter.getSpecializationsInline.mockReturnValue(
      of({ count: 0, results: [], next: "", previous: "" } as ApiPagination<Specialization>),
    );

    repository.getSpecializationsInline("dev", 10, 20).subscribe();

    expect(adapter.getSpecializationsInline).toHaveBeenCalledExactlyOnceWith("dev", 10, 20);
  });
});
