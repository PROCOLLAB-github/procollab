/** @format */

import { TestBed } from "@angular/core/testing";
import { ChatResolver } from "./chat.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";

describe("ChatResolver", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ChatGroupsRepositoryPort,
          useValue: { getChats: () => of([]), getChat: () => of({}) },
        },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ChatResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
