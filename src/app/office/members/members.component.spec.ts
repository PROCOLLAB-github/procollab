/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MembersComponent } from "./members.component";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { ReactiveFormsModule } from "@angular/forms";
import { UiModule } from "@ui/ui.module";

describe("MembersComponent", () => {
  let component: MembersComponent;
  let fixture: ComponentFixture<MembersComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj([{ profile: of({}) }]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule, UiModule],
      declarations: [MembersComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
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
