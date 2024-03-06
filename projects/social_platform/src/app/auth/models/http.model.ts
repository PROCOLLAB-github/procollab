/** @format */

export class LoginRequest {
  email!: string;
  password!: string;
}

export class LoginResponse {
  access!: string;
  refresh!: string;
}

export class RefreshResponse {
  access!: string;
  refresh!: string;
}

export class RegisterRequest {
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
}

export class RegisterResponse extends LoginResponse {
}
