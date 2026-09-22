/** @format */

import { signal } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { NavService } from "@api/shared/nav.service";
import { InviteInfoService } from "@api/invite/facades/invite-info.service";
import { CreateProjectUseCase } from "../use-cases/create-project.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { ProjectCount, ProjectCountLoadState } from "@domain/project/project.model";
import { ProjectsUIInfoService } from "./ui/projects-ui-info.service";
import { ProjectsInfoService } from "./projects-info.service";

describe("ProjectsInfoService: загрузка активности", () => {
  const count: ProjectCount = {
    all: 12,
    my: 7,
    subs: 3,
    myLeader: 4,
    myInProgram: 2,
    mySubmitted: 1,
  };

  function setup(initialUrl: string) {
    const events = new Subject<NavigationEnd>();
    const router = {
      url: initialUrl,
      events,
      navigate: vi.fn(() => Promise.resolve(true)),
    };
    const repository = {
      count$: new BehaviorSubject(count),
      countState$: new BehaviorSubject<ProjectCountLoadState>("idle"),
      refreshCount: vi.fn(() => of(count)),
    };
    const searchForm = new FormGroup({ search: new FormControl("") });

    TestBed.configureTestingModule({
      providers: [
        ProjectsInfoService,
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: {}, parent: null } },
        { provide: LoggerService, useValue: { debug: vi.fn(), warn: vi.fn() } },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: InviteInfoService, useValue: { ensureLoaded: vi.fn() } },
        { provide: ProjectsUIInfoService, useValue: { searchForm, myInvites: signal([]) } },
        { provide: CreateProjectUseCase, useValue: { execute: vi.fn() } },
        { provide: ProjectRepositoryPort, useValue: repository },
      ],
    });

    return { service: TestBed.inject(ProjectsInfoService), repository, router, events };
  }

  it.each(["/office/projects/dashboard", "/office/projects/my"])(
    "запрашивает count при входе на %s",
    url => {
      const { service, repository } = setup(url);
      service.initializationProjects();
      expect(repository.refreshCount).toHaveBeenCalledOnce();
    },
  );

  it("не запрашивает count в остальных разделах и загружает при переходе в my", () => {
    const { service, repository, router, events } = setup("/office/projects/subscriptions");
    service.initializationProjects();
    expect(repository.refreshCount).not.toHaveBeenCalled();

    router.url = "/office/projects/my";
    events.next(new NavigationEnd(1, router.url, router.url));

    expect(repository.refreshCount).toHaveBeenCalledOnce();
  });
});
