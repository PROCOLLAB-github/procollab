/** @format */

import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { ProjectRatingComponent } from "./project-rating.component";

type RatingValue = Record<string, string | number | boolean>;

@Component({
  imports: [ReactiveFormsModule, ProjectRatingComponent],
  template: `<app-project-rating [criteria]="criteria" [formControl]="rating" />`,
})
class ProjectRatingHostComponent {
  readonly criteria: ProjectRatingCriterion[] = [
    {
      id: 1,
      name: "Score",
      description: "",
      type: "int",
      minValue: 0,
      maxValue: 5,
      value: 4,
      expertId: 7,
    },
    {
      id: 2,
      name: "Approved",
      description: "",
      type: "bool",
      minValue: null,
      maxValue: null,
      value: "true",
      expertId: 7,
    },
    {
      id: 3,
      name: "Comment",
      description: "",
      type: "str",
      minValue: null,
      maxValue: null,
      value: "Existing",
      expertId: 7,
    },
  ];
  readonly rating = new FormControl<RatingValue | null>(null);
}

describe("ProjectRatingComponent", () => {
  let fixture: ComponentFixture<ProjectRatingHostComponent>;
  let host: ProjectRatingHostComponent;
  let rating: ProjectRatingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRatingHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectRatingHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    rating = fixture.debugElement.children[0].componentInstance as ProjectRatingComponent;
  });

  it("synchronizes every backend criterion into the parent control without user input", () => {
    expect(rating.form.getRawValue()).toEqual({ 1: 4, 2: true, 3: "Existing" });
    expect(host.rating.getRawValue()).toEqual({ 1: 4, 2: true, 3: "Existing" });
  });

  it("keeps the full parent snapshot when one criterion changes", () => {
    rating.form.get("1")!.setValue(5);

    expect(host.rating.getRawValue()).toEqual({ 1: 5, 2: true, 3: "Existing" });
  });

  it("applies a parent value written after rebuild without dropping other criteria", () => {
    host.rating.setValue({ 1: 3, 2: false, 3: "Updated" });
    fixture.detectChanges();

    expect(rating.form.getRawValue()).toEqual({ 1: 3, 2: false, 3: "Updated" });
    expect(host.rating.getRawValue()).toEqual({ 1: 3, 2: false, 3: "Updated" });
  });
});
