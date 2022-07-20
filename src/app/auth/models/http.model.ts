/** @format */

export class LoginRequest {
  email!: string;
  password!: string;
}

export class LoginResponse {
  accessToken!: string;
  refreshToken!: string;
  tokenType!: "Bearer";
}

export class RefreshResponse {
  accessToken!: string;
  refreshToken!: string;
  tokenType!: "Bearer";
}

export class RegisterRequest {
  name!: string;
  surname!: string;
  birthday!: string;
  email!: string;
  password!: string;
}
export class RegisterResponse extends LoginResponse {}
