/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectInfoComponent } from "./info.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ProjectNewsRepository as ProjectNewsService } from "@infrastructure/repository/project/project-news.repository";
import { ReactiveFormsModule } from "@angular/forms";

describe("ProjectInfoComponent", () => {
  let component: ProjectInfoComponent;
  let fixture: ComponentFixture<ProjectInfoComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };
    const projectNewsServiceSpy = jasmine.createSpyObj({ fetchNews: of({}) });

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        ProjectInfoComponent,
      ],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
