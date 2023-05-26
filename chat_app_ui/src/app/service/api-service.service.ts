import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  login(data: any) {
    return this.http.post(this.baseUrl + 'login', data);
  }
}
