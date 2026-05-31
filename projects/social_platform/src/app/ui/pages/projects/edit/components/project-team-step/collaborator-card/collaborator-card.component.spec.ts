/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CollaboratorCardComponent } from "./collaborator-card.component";
import { provideRouter } from "@angular/router";
import { RemoveProjectCollaboratorUseCase } from "@api/project/use-cases/remove-project-collaborator.use-case";

describe("CollaboratorCardComponent", () => {
  let component: CollaboratorCardComponent;
  let fixture: ComponentFixture<CollaboratorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorCardComponent],
      providers: [
        provideRouter([]),
        {
          provide: RemoveProjectCollaboratorUseCase,
          useValue: { execute: jasmine.createSpy("execute") },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaboratorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
