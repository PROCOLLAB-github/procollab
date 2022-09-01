/** @format */

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../../../auth/services";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "../../../error/models/error-message";
import { SelectComponent } from "../../../ui/components";
import { ValidationService } from "../../../core/services";
import { Subscription } from "rxjs";

@Component({
  selector: "app-profile-edit",
  templateUrl: "./profile-edit.component.html",
  styleUrls: ["./profile-edit.component.scss"],
})
export class ProfileEditComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private cdref: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      name: ["", [Validators.required]],
      surname: ["", [Validators.required]],
      status: ["", [Validators.required]],
      birthday: ["", [Validators.required]],
      city: ["", [Validators.required]],
      organisation: ["", [Validators.required]],
      speciality: ["", [Validators.required]],
      keySkills: this.fb.array([]),
      aboutMe: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.profile$ = this.authService.profile.subscribe(profile => {
      setTimeout(() => {
        this.profileForm.patchValue({
          name: profile.name ?? "",
          surname: profile.surname ?? "",
          status: profile.status ?? "",
          birthday: profile.birthday ?? "",
          city: profile.city ?? "",
          organisation: profile.organisation ?? "",
          speciality: profile.speciality ?? "",
          aboutMe: profile.aboutMe ?? "",
        });

        // profile.achievements.forEach(achievement => this.addAchievement(achievement));
        profile.keySkills.forEach(skill => this.addKeySkill(skill));
      });
    });
  }

  ngOnDestroy(): void {
    this.profile$?.unsubscribe();
  }

  profile$?: Subscription;

  get achievements(): FormArray {
    return this.profileForm.get("achievements") as FormArray;
  }

  errorMessage = ErrorMessage;

  statusOptions: SelectComponent["options"] = [
    { id: 1, value: "Ученик", label: "Ученик" },
    { id: 2, value: "Ментор", label: "Ментор" },
  ];

  profileFormSubmitting = false;
  profileForm: FormGroup;

  // newAchievementTitle = "";
  // addAchievement(title?: string): void {
  //   this.achievements.push(
  //     title ? this.fb.control(title) : this.fb.control(this.newAchievementTitle)
  //   );
  //
  //   setTimeout(() => {
  //     this.achievements.at(this.achievements.length - 1).setValue(this.newAchievementTitle);
  //     this.newAchievementTitle = "";
  //   });
  // }
  //
  // removeAchievement(i: number): void {
  //   this.achievements.removeAt(i);
  // }

  get keySkills(): FormArray {
    return this.profileForm.get("keySkills") as FormArray;
  }

  newKeySkillTitle = "";
  addKeySkill(title?: string): void {
    this.keySkills.push(title ? this.fb.control(title) : this.fb.control(this.newKeySkillTitle));

    setTimeout(() => {
      this.newKeySkillTitle = "";
    });
  }

  removeKeySkill(i: number): void {
    this.keySkills.removeAt(i);
  }

  saveProfile(): void {
    console.log(this.profileForm.errors, this.profileForm);
    if (!this.validationService.getFormValidation(this.profileForm)) {
      return;
    }
    this.profileFormSubmitting = true;

    this.authService.saveProfile(this.profileForm.value).subscribe(
      () => {
        this.profileFormSubmitting = false;
      },
      () => {
        this.profileFormSubmitting = false;
      }
    );
  }
}
