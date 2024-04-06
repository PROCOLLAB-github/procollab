/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "@uilib";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "skills";
  navItems = [
    { name: "Навыки", icon: "lib", link: "/skills" },
    { name: "Рейтинг", icon: "growth", link: "rating" },
  ];

  user = {
    id: 87,
    user_type: 1,
    email: "example@gmail.com",
    firstName: "Егор",
    lastName: "Токарев",
    patronymic: null,
    skills: [
      {
        id: 379,
        name: "TypeScript",
        category: {
          id: 8,
          name: "Front-end",
        },
      },
      {
        id: 376,
        name: "VueJS",
        category: {
          id: 8,
          name: "Front-end",
        },
      },
      {
        id: 370,
        name: "Angular",
        category: {
          id: 8,
          name: "Front-end",
        },
      },
      {
        id: 374,
        name: "JavaScript",
        category: {
          id: 8,
          name: "Front-end",
        },
      },
    ],
    birthday: "2004-09-13",
    speciality: "Front-end",
    v2Speciality: null,
    organization: "rgsu",
    about_me: "Front-end программист",
    avatar:
      "https://api.selcdn.ru/v1/SEL_228194/procollab_static/95936064203650541/9435959103949330223.jpg",
    links: ["e@tokarev.work"],
    city: "moscow",
    is_active: true,
    is_online: true,
    member: {
      usefulToProject: "",
    },
    investor: null,
    expert: null,
    mentor: null,
    achievements: [],
    verificationDate: "2023-05-15",
    onboardingStage: null,
    projects: [
      {
        id: 2,
        name: "PROCOLLAB",
        leader: 95,
        shortDescription:
          "Платформа для инновационной молодежи (https://procollab.ru). Платформа разработана как инс...",
        imageAddress:
          "https://api.selcdn.ru/v1/SEL_228194/procollab_static/8239567005167880384/10690626131135523.png",
        industry: 1,
        viewsCount: 251,
        collaborator: {
          userId: 87,
          firstName: "Егор",
          lastName: "Токарев",
          role: "Frontend developer",
          skills: [
            {
              id: 379,
              name: "TypeScript",
              category: {
                id: 8,
                name: "Front-end",
              },
            },
            {
              id: 376,
              name: "VueJS",
              category: {
                id: 8,
                name: "Front-end",
              },
            },
            {
              id: 370,
              name: "Angular",
              category: {
                id: 8,
                name: "Front-end",
              },
            },
            {
              id: 374,
              name: "JavaScript",
              category: {
                id: 8,
                name: "Front-end",
              },
            },
          ],
          avatar:
            "https://api.selcdn.ru/v1/SEL_228194/procollab_static/95936064203650541/9435959103949330223.jpg",
        },
      },
    ],
  } as unknown as User;
}
