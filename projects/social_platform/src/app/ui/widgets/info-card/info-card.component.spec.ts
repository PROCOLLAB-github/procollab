/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { InfoCardComponent } from "./info-card.component";
import { provideRouter } from "@angular/router";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { EventBus } from "@domain/shared/event-bus";

describe("ProjectCardComponent", () => {
  let component: InfoCardComponent;
  let fixture: ComponentFixture<InfoCardComponent>;

  beforeEach(async () => {
    const industrySpy = { industries: () => of([]), getOne: () => of({ name: "Test Industry" }) };

    await TestBed.configureTestingModule({
      imports: [InfoCardComponent],
      providers: [
        { provide: IndustryRepositoryPort, useValue: industrySpy },
        { provide: ProjectSubscriptionRepositoryPort, useValue: { addSubscription: of({}), deleteSubscription: of({}) } },
        { provide: EventBus, useValue: { emit: () => {} } },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("info", {
      id: 1,
      name: "Test Project",
      description: "",
      skills: [],
      status: "active",
      isCompetitive: false,
    });
    fixture.componentRef.setInput("type", "projects");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
