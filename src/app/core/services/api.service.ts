/** @format */

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { first, Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ApiService {
  constructor(private http: HttpClient) {
  }

  get<T>(path: string, params?: HttpParams, options?: object): Observable<T> {
    return this.http
      .get(environment.apiUrl + path, { params, ...options })
      .pipe(first()) as Observable<T>;
  }

  put<T>(path: string, body: object): Observable<T> {
    return this.http.put<T>(environment.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  post<T>(path: string, body: object): Observable<T> {
    return this.http.post<T>(environment.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  delete<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http
      .delete<T>(environment.apiUrl + path, { params })
      .pipe(first()) as Observable<T>;
  }
}
