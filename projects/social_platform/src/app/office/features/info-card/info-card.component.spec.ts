/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { of } from "rxjs";
import { IndustryService } from "@services/industry.service";
import { InfoCardComponent } from "./info-card.component";

describe("ProjectCardComponent", () => {
  let component: InfoCardComponent;
  let fixture: ComponentFixture<InfoCardComponent>;

  beforeEach(async () => {
    const industrySpy = jasmine.createSpyObj([{ industries: of([]) }]);

    await TestBed.configureTestingModule({
      imports: [InfoCardComponent],
      providers: [{ provide: IndustryService, useValue: industrySpy }],
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
