/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User, UserRole } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";

@Injectable({ providedIn: "root" })
export class AuthInfoService {
  private readonly authRepository = inject(AuthRepositoryPort);

  readonly profile = this.authRepository.profile;
  readonly roles = this.authRepository.roles;
  readonly changeableRoles = this.authRepository.changeableRoles;

  fetchProfile(): Observable<User> {
    return this.authRepository.fetchProfile();
  }

  fetchUser(id: number): Observable<User> {
    return this.authRepository.fetchUser(id);
  }

  fetchLeaderProjects(): Observable<ApiPagination<Project>> {
    return this.authRepository.fetchLeaderProjects();
  }

  fetchUserRoles(): Observable<UserRole[]> {
    return this.authRepository.fetchUserRoles();
  }

  fetchChangeableRoles(): Observable<UserRole[]> {
    return this.authRepository.fetchChangeableRoles();
  }

  logout(): Observable<void> {
    return this.authRepository.logout();
  }
}
