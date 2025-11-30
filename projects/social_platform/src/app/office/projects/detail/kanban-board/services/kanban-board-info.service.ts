/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { TaskDetail } from "../models/task.model";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { filter } from "rxjs";
import { ProjectDataService } from "../../services/project-data.service";

@Injectable({
  providedIn: "root",
})
export class KanbanBoardInfoService {
  taskDetail = signal<TaskDetail | undefined>(
    undefined
    // {
    //   id: 5,
    //   columnId: 0,
    //   title: "Начинаем новый проект",
    //   priority: 0,
    //   type: 2,
    //   description: null,
    //   deadlineDate: "12-11-2025",
    //   tags: [],
    //   goal: null,
    //   files: [],
    //   responsible: null,
    //   performers: [],
    //   score: 10,
    //   creator:
    //   {
    //     id: 56,
    //     avatar: "https://api.selcdn.ru/v1/SEL_228194/procollab_media/5388035211510428528/2458680223122098610_2202079899633949339.webp",
    //     firstName: "Егоg",
    //     lastName: "Токареg",
    //   },
    //   datetimeCreated: "11-10-2025 12:00",
    //   datetimeTaskStart: "11-11-2025",
    //   requiredSkills: [],
    //   isLeaderLeaveComment: false,
    //   projectGoal: null,
    //   result: null,

    //   // result: {
    //   //   isVerified: false,
    //   //   description: "123",
    //   //   accompanyingFile: null,
    //   //   whoVerified: {
    //   //     id: 11,
    //   //     firstName: "Егоg",
    //   //     lastName: "Токареg",
    //   //   }
    //   // },
    // }
  );

  currentUser = signal<User | null>(null);

  private readonly authService = inject(AuthService);
  private readonly projectDataService = inject(ProjectDataService);

  constructor() {
    this.authService.profile
      .pipe(filter(Boolean))
      .subscribe(profile => this.currentUser.set(profile));
  }

  setTaskDetailInfo(detail: TaskDetail | undefined) {
    this.taskDetail.set(detail);
  }

  leaderId = this.projectDataService.leaderId;
  collaborators = this.projectDataService.collaborators;

  isLeader = computed(() => {
    const user = this.currentUser();
    const leader = this.leaderId();
    return !!user && user.id === leader;
  });

  isCreator = computed(() => {
    const user = this.currentUser();
    const task = this.taskDetail();
    return !!user && user.id === task?.creator?.id;
  });

  isPerformer = computed(() => {
    const user = this.currentUser();
    const task = this.taskDetail();
    return !!user && !!task?.performers?.some(p => p.id === user.id);
  });

  isResponsible = computed(() => {
    const user = this.currentUser();
    const task = this.taskDetail();
    return !!user && user.id === task?.responsible?.id;
  });

  isExternal = computed(() => {
    return !(this.isLeader() || this.isCreator() || this.isPerformer() || this.isResponsible());
  });

  isTaskResult = computed(() => {
    return this.taskDetail()?.result;
  });

  isLeaderAcceptResult = computed(() => {
    const result = this.isTaskResult();
    const leaderId = this.leaderId();

    if (!leaderId || !result) return false;

    return !!result && result.isVerified && result.whoVerified.id === leaderId;
  });

  isLeaderLeaveComment = computed(() => this.taskDetail()?.isLeaderLeaveComment);
}
