/** @format */

// TODO make camel case
export class LoginResponse {
  // @ts-ignore
  access_token: string;
  // @ts-ignore
  refresh_token: string;
  // @ts-ignore
  token_type: "Bearer";
}

export class RefreshResponse {
  // @ts-ignore
  access_token: string;
  // @ts-ignore
  refresh_token: string;
  // @ts-ignore
  token_type: "Bearer";
}

export class RegisterRequest {}
export class RegisterResponse {}
