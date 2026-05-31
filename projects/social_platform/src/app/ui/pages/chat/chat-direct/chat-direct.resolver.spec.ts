/** @format */

import { TestBed } from "@angular/core/testing";
import { ChatDirectResolver } from "./chat-direct.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";

describe("ChatDirectResolver", () => {
  const mockRoute = { params: { chatId: 1 } } as unknown as ActivatedRouteSnapshot;
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
      ChatDirectResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
