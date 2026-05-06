/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveEditMessageUseCase } from "./observe-edit-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnEditChatMessageDto } from "@domain/chat/chat.model";

describe("ObserveEditMessageUseCase", () => {
  let useCase: ObserveEditMessageUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;
  let subject: Subject<OnEditChatMessageDto>;

  function setup(): void {
    subject = new Subject();
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["onEditMessage"]);
    rt.onEditMessage.and.returnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveEditMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveEditMessageUseCase);
  }

  it("делегирует в chatRealtime.onEditMessage", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onEditMessage).toHaveBeenCalledOnceWith();
  });

  it("пробрасывает события из observable", done => {
    setup();
    const event = { chatId: "1" } as OnEditChatMessageDto;

    useCase.execute().subscribe(e => {
      expect(e).toBe(event);
      done();
    });

    subject.next(event);
  });
});
