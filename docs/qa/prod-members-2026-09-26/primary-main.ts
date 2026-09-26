/** @format */

import "@angular/compiler";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { provideRouter, Router, RouterOutlet } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { API_URL } from "@corelib";
import { FormBuilder } from "@angular/forms";
import { MembersComponent } from "../projects/social_platform/src/app/ui/pages/members/members.component";
import { MembersInfoService } from "@api/member/facades/members-info.service";
import { MembersUIInfoService } from "@api/member/facades/ui/members-ui-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { userFromRaw } from "@utils/userRaw";
import { SearchesService } from "@api/searches/searches.service";
const names = [
  ["Иван", "Иванов"],
  ["Анна", "Петрова"],
  ["Мария", "Смирнова"],
  ["Дмитрий", "Соколов"],
  ["Ольга", "Орлова"],
  ["Александра-Елизавета", "Константинопольская"],
  ["Евгений", "Морозов"],
];
const skillSets = [
  [],
  ["Java"],
  ["PostgreSQL", "Node.js"],
  ["Ведение социальных сетей и контент-маркетинг", "Редактура", "Видео", "Аналитика", "Дизайн"],
  ["Python", ...Array.from({ length: 10 }, (_, i) => "Навык " + (i + 1))],
  ["TypeScript"],
  ["Аналитика"],
];
const members = names.map(([firstName, lastName], i) => ({
  id: i + 100,
  firstName,
  lastName,
  avatar: "/assets/images/profile/main.svg",
  speciality: i === 6 ? "Исследователь образовательных технологий" : "Разработчик",
  birthday: "2000-05-14",
  skills: skillSets[i].map((name, id) => ({
    id,
    name,
    category: { id: 1, name: "Hard skills" },
    approves: [],
  })),
}));
const suggestions = {
  inlineSpecs: signal<any[]>([]),
  inlineSkills: signal<any[]>([]),
  onSearchSkill() {
    this.inlineSkills.set([{ id: 1, name: "Angular" }]);
  },
  onSearchSpec() {
    this.inlineSpecs.set([{ id: 1, name: "Разработчик" }]);
  },
};
const fb = new FormBuilder();
const ui = {
  members: signal(members.map(userFromRaw)),
  searchForm: fb.group({ search: [""] }),
  filterForm: fb.group({
    keySkill: [""],
    speciality: [""],
    age: [[null, null]],
    isMosPolytechStudent: [false],
  }),
};
@Component({
  selector: "app-preview",
  imports: [RouterOutlet],
  styleUrls: ["../projects/social_platform/src/app/ui/pages/office/office.component.scss"],
  template: `<div class="office">
    <div class="office__wrapper">
      <div class="office__body">
        <div class="office__inner">
          <div class="office__inner--wrapper">
            <aside class="office__sidebar" style="padding-top:30px">
              <img src="/assets/images/shared/logo.svg" alt="PROCOLLAB" style="width:130px" />
            </aside>
            <div class="office__inner--content"><router-outlet /></div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
})
class Preview {}
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
TestBed.configureTestingModule({
  imports: [Preview],
  providers: [
    { provide: AddProjectSubscriptionUseCase, useValue: {} },
    { provide: DeleteProjectSubscriptionUseCase, useValue: {} },
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideNoopAnimations(),
    provideRouter([{ path: "office/members", component: MembersComponent }]),
    { provide: API_URL, useValue: "/fixture-api" },
    { provide: SearchesService, useValue: suggestions },
  ],
}).overrideComponent(MembersComponent, {
  set: {
    providers: [
      { provide: MembersUIInfoService, useValue: ui },
      {
        provide: MembersInfoService,
        useValue: { initializationMembers() {}, initScroll() {}, redirectToProfile() {} },
      },
      { provide: ProfileDetailUIInfoService, useValue: {} },
    ],
  },
});
TestBed.compileComponents().then(async () => {
  const f = TestBed.createComponent(Preview);
  document.body.appendChild(f.nativeElement);
  f.autoDetectChanges();
  await TestBed.inject(Router).navigateByUrl("/office/members");
});
