/** @format */
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { ProgramRegistrationRepositoryPort } from "@domain/program/ports/program-registration.repository.port";
import {
  RegistrationSettings,
  RegistrationSchema,
  RegistrationPublic,
  RegistrationImport,
  RegistrationResult,
} from "@domain/program/program-registration.model";
@Injectable()
export class ProgramRegistrationHttpAdapter implements ProgramRegistrationRepositoryPort {
  private readonly api = inject(ApiService);
  private root(id: number) {
    return `/programs/${id}`;
  }
  settings(id: number) {
    return this.api.get<RegistrationSettings>(`${this.root(id)}/management/registration/`);
  }
  save(id: number, revision: number, draft: RegistrationSchema, publish: boolean) {
    const path = `${this.root(id)}/management/registration/`;
    return publish
      ? this.api.post<RegistrationSettings>(`${path}publish/`, { revision, draft })
      : this.api.put<RegistrationSettings>(path, { revision, draft });
  }
  importOptions(id: number, file: File) {
    const data = new FormData();
    data.append("file", file);
    return this.api.post<RegistrationImport>(
      `${this.root(id)}/management/registration/import/`,
      data,
    );
  }
  connect(id: number, url: string, comment: string, contact: string) {
    return this.api.post<RegistrationSettings>(
      `${this.root(id)}/management/registration/connection/`,
      { url, comment, contact },
    );
  }
  publicForm(id: number) {
    return this.api.get<RegistrationPublic>(`${this.root(id)}/registration/`);
  }
  submit(id: number, data: object, signup: boolean) {
    return this.api.post<RegistrationResult>(
      `${this.root(id)}/registration/${signup ? "signup/" : ""}`,
      data,
    );
  }
  tokenAction(id: number, action: "confirm" | "resend", token: string) {
    return this.api.post<RegistrationResult>(`${this.root(id)}/registration/${action}/`, { token });
  }
  resetPassword(id: number, email: string) {
    return this.api.post<void>("/auth/reset_password/", { email, registrationProgramId: id });
  }
}
