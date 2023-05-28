import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {
    console.log(sessionStorage.getItem('token'))
  }

  login(data: any) {
    return this.http.post(this.baseUrl + 'login', data);
  }

  logout() {
    return this.http.get(this.baseUrl + 'logout');
  }

  get_users() {
    return this.http.get(this.baseUrl + 'get_users');
  }

  get_groups() {
    return this.http.get(this.baseUrl + 'get_groups');
  }

  get_messages(name: any) {
    return this.http.get(this.baseUrl + 'get_messages?group_name=' + name)
  }

  sendMessage(data: any) {
    return this.http.post(this.baseUrl + 'messages', data)
  }

  token_decode(token: any) {
    return jwt_decode(token);
  }

  isLoggedIn() {
    let token: any = sessionStorage.getItem('token')
    console.log(jwt_decode(token))
    if (token) {
      let userdetails: any = jwt_decode(token)
      let now = new Date()
      let tokentime = new Date(userdetails['exp'] * 1000)
      return now > tokentime ? false : true;
    } else {
      return false
    }

  }

  deleteUser(id: any) {
    return this.http.delete(this.baseUrl + 'manage_user?id=' + id)
  }

  updateUser(data: any) {
    return this.http.put(this.baseUrl + 'manage_user', data)
  }

  createUser(data: any) {
    return this.http.post(this.baseUrl + 'manage_user', data)
  }

  createGroup(data: any) {
    return this.http.post(this.baseUrl + 'manage_groups', data)
  }

  addUserGroup(data: any) {
    return this.http.put(this.baseUrl + 'manage_groups', data)
  }

}


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userToken = sessionStorage.getItem('token');
    const modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `${userToken}`).set('Content-Type', 'application/json'),
    });
    return next.handle(modifiedReq);
  }
}