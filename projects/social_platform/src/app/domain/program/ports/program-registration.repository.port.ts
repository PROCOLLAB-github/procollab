/** @format */
import { Observable } from "rxjs";
import {
  RegistrationSettings,
  RegistrationSchema,
  RegistrationPublic,
  RegistrationImport,
  RegistrationResult,
} from "../program-registration.model";
export abstract class ProgramRegistrationRepositoryPort {
  abstract settings(id: number): Observable<RegistrationSettings>;
  abstract save(
    id: number,
    revision: number,
    draft: RegistrationSchema,
    publish: boolean,
  ): Observable<RegistrationSettings>;
  abstract importOptions(id: number, file: File): Observable<RegistrationImport>;
  abstract connect(id: number, url: string, comment: string): Observable<RegistrationSettings>;
  abstract publicForm(id: number): Observable<RegistrationPublic>;
  abstract submit(id: number, data: object, signup: boolean): Observable<RegistrationResult>;
  abstract tokenAction(
    id: number,
    action: "confirm" | "resend",
    token: string,
  ): Observable<RegistrationResult>;
  abstract resetPassword(id: number, email: string): Observable<void>;
}
