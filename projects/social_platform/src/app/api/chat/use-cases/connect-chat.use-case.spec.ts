/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ConnectChatUseCase } from "./connect-chat.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";

describe("ConnectChatUseCase", () => {
  let useCase: ConnectChatUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;

  function setup(): void {
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["connect"]);
    TestBed.configureTestingModule({
      providers: [ConnectChatUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ConnectChatUseCase);
  }

  it("делегирует в chatRealtime.connect и возвращает Observable", done => {
    setup();
    rt.connect.and.returnValue(of(undefined));

    useCase.execute().subscribe({
      complete: () => {
        expect(rt.connect).toHaveBeenCalledOnceWith();
        done();
      },
    });
  });
});
