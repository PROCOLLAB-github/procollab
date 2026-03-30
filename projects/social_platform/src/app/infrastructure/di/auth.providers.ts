/** @format */

import { Provider } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { AuthRepository } from "../repository/auth/auth.repository";

export const AUTH_PROVIDERS: Provider[] = [
  { provide: AuthRepositoryPort, useExisting: AuthRepository },
];
