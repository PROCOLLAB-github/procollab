/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectDetailComponent } from "./detail.component";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";

describe("DetailComponent", () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, ProjectDetailComponent],
    providers: [{ provide: AuthService, useValue: authSpy }],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
