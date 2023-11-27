/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacancyCardComponent } from "./vacancy-card.component";
import { of } from "rxjs";
import { AuthService } from "@auth/services";

describe("VacancyCardComponent", () => {
  let component: VacancyCardComponent;
  let fixture: ComponentFixture<VacancyCardComponent>;

  beforeEach(async () => {
    const authSpy = {
      roles: of([]),
    };

    await TestBed.configureTestingModule({
    imports: [VacancyCardComponent],
    providers: [{ provide: AuthService, useValue: authSpy }],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VacancyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
