/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
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
    private validationService: ValidationService
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
      achievements: this.fb.array([]),
      aboutMe: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.profile$ = this.authService.profile.subscribe(profile => {
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

      profile.achievements?.forEach(achievement =>
        this.addAchievement(achievement.title, achievement.place)
      );
      profile.keySkills?.forEach(skill => this.addKeySkill(skill));
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

  addAchievement(title?: string, place?: string): void {
    this.achievements.push(
      this.fb.group({
        title: [title ?? "", [Validators.required]],
        place: [place ?? "", [Validators.required]],
      })
    );
  }

  removeAchievement(i: number): void {
    this.achievements.removeAt(i);
  }

  get keySkills(): FormArray {
    return this.profileForm.get("keySkills") as FormArray;
  }

  newKeySkillTitle = "";
  addKeySkill(title?: string): void {
    const fromState = title ?? this.newKeySkillTitle;
    if (!fromState) {
      return;
    }

    const control = this.fb.control(fromState, [Validators.required]);
    this.keySkills.push(control);

    this.newKeySkillTitle = "";
  }

  removeKeySkill(i: number): void {
    this.keySkills.removeAt(i);
  }

  saveProfile(): void {
    if (!this.validationService.getFormValidation(this.profileForm) || this.profileFormSubmitting) {
      return;
    }
    setTimeout(() => {
      this.profileFormSubmitting = true;
    }, 0);

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
