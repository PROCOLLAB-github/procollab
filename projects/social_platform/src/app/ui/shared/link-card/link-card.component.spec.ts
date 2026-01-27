/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { LinkCardComponent } from "./link-card.component";

describe("VacancyCardComponent", () => {
  let component: LinkCardComponent;
  let fixture: ComponentFixture<LinkCardComponent>;

  beforeEach(async () => {
    const authSpy = {
      roles: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [LinkCardComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
