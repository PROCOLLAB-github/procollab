/** @format */
import { inject, Injectable } from "@angular/core";
import { ProgramRegistrationRepositoryPort } from "@domain/program/ports/program-registration.repository.port";
@Injectable()
export class ProgramRegistrationUseCase {
  private readonly repository = inject(ProgramRegistrationRepositoryPort);
  readonly settings = this.repository.settings.bind(this.repository);
  readonly save = this.repository.save.bind(this.repository);
  readonly importOptions = this.repository.importOptions.bind(this.repository);
  readonly connect = this.repository.connect.bind(this.repository);
  readonly publicForm = this.repository.publicForm.bind(this.repository);
  readonly submit = this.repository.submit.bind(this.repository);
  readonly tokenAction = this.repository.tokenAction.bind(this.repository);
  readonly resetPassword = this.repository.resetPassword.bind(this.repository);
}
