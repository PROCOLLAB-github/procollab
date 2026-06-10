/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ConnectChatUseCase } from "./connect-chat.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";

describe("ConnectChatUseCase", () => {
  let useCase: ConnectChatUseCase;
  let rt: any;

  function setup(): void {
    rt = { connect: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ConnectChatUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ConnectChatUseCase);
  }

  it("делегирует в chatRealtime.connect и возвращает Observable", () =>
    new Promise<void>(done => {
      setup();
      rt.connect.mockReturnValue(of(undefined));

      useCase.execute().subscribe({
        complete: () => {
          expect(rt.connect).toHaveBeenCalledExactlyOnceWith();
          done();
        },
      });
    }));
});
