/** @format */

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { first, Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // eslint-disable-next-line no-undef
  get(path: string, params?: any, options?: any): Observable<any> {
    return this.http.get(environment.apiUrl + path, { params, ...options }).pipe(first());
  }

  put(path: string, body: object): Observable<any> {
    return this.http.put(environment.apiUrl + path, body).pipe(first());
  }

  post(path: string, body: object): Observable<any> {
    return this.http.post(environment.apiUrl + path, body).pipe(first());
  }

  delete(path: string): Observable<any> {
    return this.http.delete(environment.apiUrl + path).pipe(first());
  }
}
