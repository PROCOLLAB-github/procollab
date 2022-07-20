/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";

@Injectable()
export class AuthService {
  constructor(private apiService: ApiService) {}
}
