/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { of } from "rxjs";
import { IndustryRepository } from "projects/social_platform/src/app/infrastructure/repository/industry/industry.repository";
import { InfoCardComponent } from "./info-card.component";

describe("ProjectCardComponent", () => {
  let component: InfoCardComponent;
  let fixture: ComponentFixture<InfoCardComponent>;

  beforeEach(async () => {
    const industrySpy = jasmine.createSpyObj([{ industries: of([]) }]);

    await TestBed.configureTestingModule({
      imports: [InfoCardComponent],
      providers: [{ provide: IndustryRepository, useValue: industrySpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCardComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
