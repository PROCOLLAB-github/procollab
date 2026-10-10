/** @format */

import { TestBed } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";
import { UserInput } from "@domain/auth/user.model";
import { OnboardingStageOneUIInfoService } from "./onboarding-stage-one-ui-info.service";

describe("OnboardingStageOneUIInfoService draft synchronization", () => {
  it("restores the draft silently and publishes a user change only once", () => {
    TestBed.configureTestingModule({ providers: [OnboardingStageOneUIInfoService] });
    const ui = TestBed.inject(OnboardingStageOneUIInfoService);
    const draft = new BehaviorSubject<UserInput>({ speciality: "Frontend" });
    const publish = vi.fn((value: UserInput) => {
      if (publish.mock.calls.length <= 5) draft.next(value);
    });
    const draftSubscription = draft.subscribe(value => ui.applyInitSpeciality(value));
    const formSubscription = ui.stageForm.valueChanges.subscribe(publish);
    ui.applyInitFormValues(draft.value);
    expect(publish).not.toHaveBeenCalled();
    ui.stageForm.patchValue({ speciality: "Backend" });
    expect(publish).toHaveBeenCalledOnce();
    expect(draft.value.speciality).toBe("Backend");
    formSubscription.unsubscribe();
    draftSubscription.unsubscribe();
  });
});
