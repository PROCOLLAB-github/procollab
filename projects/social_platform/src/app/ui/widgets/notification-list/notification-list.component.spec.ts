/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Notification } from "@domain/other/notification.model";
import { NotificationService } from "@ui/services/notification/notification.service";
import { NotificationListComponent } from "./notification-list.component";

describe("NotificationListComponent", () => {
  it("открывает административный запрос отдельно и сохраняет переход к экспертам", async () => {
    const notices: Notification[] = [
      {
        id: "registration_connection:4",
        kind: "registration_connection",
        text: "Запрос на подключение сайта мероприятия",
        readAt: null,
        programId: 2,
        registrationId: 6,
        createdAt: "2026-10-20T12:00:00Z",
      },
      {
        id: "expert_joined:4",
        kind: "expert_joined",
        text: "Эксперт принял приглашение",
        readAt: null,
        programId: 2,
        createdAt: "2026-10-20T11:00:00Z",
      },
    ];
    const service = {
      notifications: new BehaviorSubject(notices),
      failed: signal(false),
      reading: signal(null),
      read: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [NotificationListComponent],
      providers: [provideRouter([]), { provide: NotificationService, useValue: service }],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotificationListComponent);
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css("a"));
    expect(links[0].nativeElement.getAttribute("href")).toBe(
      "/admin/partner_programs/programregistration/6/change/",
    );
    expect(links[0].nativeElement.getAttribute("target")).toBe("_blank");
    expect(links[0].nativeElement.getAttribute("rel")).toContain("noopener");
    expect(links[1].nativeElement.getAttribute("href")).toBe(
      "/office/program/2/management/experts",
    );
    links[0].triggerEventHandler("click");
    expect(service.read).toHaveBeenCalledWith(notices[0]);
    expect(fixture.nativeElement.textContent).toContain("Отметить прочитанным");
  });
});
