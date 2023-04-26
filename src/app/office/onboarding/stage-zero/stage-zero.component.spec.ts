/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageZeroComponent } from "./stage-zero.component";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgxMaskModule } from "ngx-mask";

describe("StageZeroComponent", () => {
  let component: OnboardingStageZeroComponent;
  let fixture: ComponentFixture<OnboardingStageZeroComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      saveProfile: of({}),
      setOnboardingStage: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        CoreModule,
        UiModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
      ],
      declarations: [OnboardingStageZeroComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingStageZeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
