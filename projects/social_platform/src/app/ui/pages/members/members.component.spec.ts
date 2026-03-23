/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MembersComponent } from "./members.component";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MembersComponent", () => {
  let component: MembersComponent;
  let fixture: ComponentFixture<MembersComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj([{ profile: of({}) }]);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MembersComponent,
      ],
      providers: [{ provide: AuthRepository, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
