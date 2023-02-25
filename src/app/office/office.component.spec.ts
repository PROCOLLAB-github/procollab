/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OfficeComponent } from "./office.component";
import { IndustryService } from "@services/industry.service";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";

describe("OfficeComponent", () => {
  let component: OfficeComponent;
  let fixture: ComponentFixture<OfficeComponent>;

  beforeEach(async () => {
    const authSpy = { getUserRoles: of([]), profile: of({}) };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [IndustryService, { provide: AuthService, useValue: authSpy }],
      declarations: [OfficeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
