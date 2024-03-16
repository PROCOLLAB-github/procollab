/** @format */

// import { ComponentFixture, TestBed } from "@angular/core/testing";
//
// import { ProjectsComponent } from "./projects.component";
// import { RouterTestingModule } from "@angular/router/testing";
// import { HttpClientTestingModule } from "@angular/common/http/testing";
// import { ReactiveFormsModule } from "@angular/forms";
// import { of } from "rxjs";
// import { AuthService } from "../../auth/services";
// import { ProjectService } from "../services/project.service";
// import { User } from "../../auth/models/user.model";
// import { Project } from "../models/project.model";
//
// describe("ProjectsComponent", () => {
//   let component: ProjectsComponent;
//   let fixture: ComponentFixture<ProjectsComponent>;
//
//   beforeEach(async () => {
//     const projectSpy = {
//       create: of({}),
//     };
//     const authSpy = {
//       profile: of({}),
//     };
//
//     await TestBed.configureTestingModule({
//       imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
//       providers: [
//         { providers: ProjectService, useValue: projectSpy },
//         { providers: AuthService, useValue: authSpy },
//       ],
//       declarations: [ProjectsComponent],
//     }).compileComponents();
//   });
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(ProjectsComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it("should create", () => {
//     expect(component).toBeTruthy();
//   });
// });
