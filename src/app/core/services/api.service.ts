/** @format */

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // eslint-disable-next-line no-undef
  get(path: string, params?: any, options?: any): Observable<any> {
    return this.http.get(environment.apiUrl + path, { params, ...options });
  }

  put(path: string, body: object): Observable<any> {
    return this.http.put(environment.apiUrl + path, body);
  }

  post(path: string, body: object): Observable<any> {
    return this.http.post(environment.apiUrl + path, body);
  }

  delete(path: string): Observable<any> {
    return this.http.delete(environment.apiUrl + path);
  }
}
