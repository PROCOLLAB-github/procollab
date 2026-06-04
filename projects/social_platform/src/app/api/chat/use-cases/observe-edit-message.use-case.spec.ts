/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveEditMessageUseCase } from "./observe-edit-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnEditChatMessageDto } from "@domain/chat/chat.model";

describe("ObserveEditMessageUseCase", () => {
  let useCase: ObserveEditMessageUseCase;
  let rt: any;
  let subject: Subject<OnEditChatMessageDto>;

  function setup(): void {
    subject = new Subject();
    rt = { onEditMessage: vi.fn() };
    rt.onEditMessage.mockReturnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveEditMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveEditMessageUseCase);
  }

  it("делегирует в chatRealtime.onEditMessage", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onEditMessage).toHaveBeenCalledExactlyOnceWith();
  });

  it("пробрасывает события из observable", () =>
    new Promise<void>(done => {
      setup();
      const event = { chatId: "1" } as OnEditChatMessageDto;

      useCase.execute().subscribe(e => {
        expect(e).toBe(event);
        done();
      });

      subject.next(event);
    }));
});
