/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MentorsComponent } from "./mentors.component";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { ReactiveFormsModule } from "@angular/forms";
import { UiModule } from "@ui/ui.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MembersComponent", () => {
  let component: MentorsComponent;
  let fixture: ComponentFixture<MentorsComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj([{ profile: of({}) }]);

    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, ReactiveFormsModule, UiModule, HttpClientTestingModule, MentorsComponent],
    providers: [{ provide: AuthService, useValue: authSpy }],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MentorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
