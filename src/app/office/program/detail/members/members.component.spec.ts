/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramMembersComponent } from "./members.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MembersComponent", () => {
  let component: ProgramMembersComponent;
  let fixture: ComponentFixture<ProgramMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ProgramMembersComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
