/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { catchError, map, Observable, tap } from "rxjs";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { AuthService } from "@auth/services";
import { ChatService } from "@services/chat.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { YearsFromBirthdayPipe } from "projects/core";
import { BarComponent, ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { BackComponent } from "@uilib";
import { AsyncPipe } from "@angular/common";
import { error } from "console";
import { saveAs } from "file-saver";
import { Base64 } from 'js-base64';

@Component({
  selector: "app-profile-detail",
  templateUrl: "./profile-detail.component.html",
  styleUrl: "./profile-detail.component.scss",
  standalone: true,
  imports: [
    RouterLinkActive,
    RouterLink,
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    RouterOutlet,
    AsyncPipe,
    YearsFromBirthdayPipe,
    BarComponent,
    BackComponent,
  ],
})
export class ProfileDetailComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly navService: NavService,
    public readonly authService: AuthService,
    public readonly chatService: ChatService,
    public readonly breakpointObserver: BreakpointObserver
  ) { }

  user$: Observable<User> = this.route.data.pipe(map(r => r["data"][0]));
  loggedUserId$: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль");
  }

  savePDF(base64Data: string) {
    // Удаляем все символы, которые не являются частью Base64
    let sanitizedBase64 = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');

    // Проверяем и добавляем необходимое количество символов '=' для корректного выравнивания
    const padding = sanitizedBase64.length % 4;
    if (padding > 0) {
      sanitizedBase64 += '='.repeat(4 - padding);
    }

    try {
      const  byteCharacters = atob(sanitizedBase64);
      const byteNumbers = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteNumbers], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'сv.pdf';
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Ошибка при декодировании Base64:', error);
    }
  }

  downloadCV() {
    this.authService.downloadCV().subscribe((response: string) => {
      console.log(response);
      this.savePDF(response);
    });
  }
}
