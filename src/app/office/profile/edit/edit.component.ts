/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../../../auth/services";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "../../../error/models/error-message";
import { SelectComponent } from "../../../ui/components";
import { ValidationService } from "../../../core/services";
import { concatMap, first, Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-profile-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class ProfileEditComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ["", [Validators.required]],
      surname: ["", [Validators.required]],
      email: [""],
      status: [""],
      birthday: [""],
      city: [""],
      organisation: [""],
      speciality: [""],
      keySkills: this.fb.array([]),
      achievements: this.fb.array([]),
      photoAddress: [""],
      aboutMe: [""],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.profile$ = this.authService.profile.pipe(first()).subscribe(profile => {
      this.profileId = profile.id;

      this.profileForm.patchValue({
        name: profile.name ?? "",
        surname: profile.surname ?? "",
        email: profile.email ?? "",
        status: profile.status ?? "",
        birthday: profile.birthday ?? "",
        city: profile.city ?? "",
        organisation: profile.organisation ?? "",
        speciality: profile.speciality ?? "",
        photoAddress: profile.photoAddress ?? "",
        aboutMe: profile.aboutMe ?? "",
      });

      profile.achievements.length &&
        profile.achievements?.forEach(achievement =>
          this.addAchievement(achievement.title, achievement.place)
        );
      profile.keySkills.length && profile.keySkills?.forEach(skill => this.addKeySkill(skill));
    });
  }

  ngOnDestroy(): void {
    this.profile$?.unsubscribe();
  }

  profileId?: number;

  profile$?: Subscription;

  get achievements(): FormArray {
    return this.profileForm.get("achievements") as FormArray;
  }

  errorMessage = ErrorMessage;

  statusOptions: SelectComponent["options"] = [
    { id: 1, value: "Ученик", label: "Ученик" },
    { id: 2, value: "Ментор", label: "Ментор" },
    { id: 3, value: "Эксперт", label: "Эксперт" },
    { id: 4, value: "Инвестор", label: "Инвестор" },
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

    this.profileFormSubmitting = true;

    this.authService
      .saveProfile(this.profileForm.value)
      .pipe(concatMap(() => this.authService.getProfile()))
      .subscribe(
        () => {
          this.profileFormSubmitting = false;
          this.router
            .navigateByUrl(`/office/profile/${this.profileId}`)
            .then(() => console.debug("Router Changed form ProfileEditComponent"));
        },
        () => {
          this.profileFormSubmitting = false;
        }
      );
  }
}
