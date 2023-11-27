/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacancySendComponent } from "./send.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";

describe("VacancySendComponent", () => {
  let component: VacancySendComponent;
  let fixture: ComponentFixture<VacancySendComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      roles: of([]),
    };

    await TestBed.configureTestingModule({
    imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        CoreModule,
        UiModule,
        VacancySendComponent,
    ],
    providers: [{ provide: AuthService, useValue: authSpy }],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VacancySendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
