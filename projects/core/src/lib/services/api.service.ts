/** @format */

import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { first, Observable } from "rxjs";
import { API_URL } from "../providers";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly apiUrl: string
  ) {}

  get<T>(path: string, params?: HttpParams, options?: object): Observable<T> {
    return this.http.get(this.apiUrl + path, { params, ...options }).pipe(first()) as Observable<T>;
  }

  put<T>(path: string, body: object): Observable<T> {
    return this.http.put<T>(this.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  patch<T>(path: string, body: object): Observable<T> {
    return this.http.patch(this.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  post<T>(path: string, body: object): Observable<T> {
    return this.http.post<T>(this.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  delete<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(this.apiUrl + path, { params }).pipe(first()) as Observable<T>;
  }
}
