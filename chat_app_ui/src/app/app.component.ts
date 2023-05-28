import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from './service/api-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'chat_app_ui';
  isAdmin = false;
  userdetails: any;
  isLoggedin = false;
  constructor(private reqs: ApiServiceService, private roter: Router) {

  }
  ngOnInit(): void {
    let token = sessionStorage.getItem('token');
    if (token) {
      this.userdetails = this.reqs.token_decode(token);
      this.isLoggedin = this.reqs.isLoggedIn()

      if (this.userdetails['role'] == 'admin') {
        this.isAdmin = true;
      }
    }
  }

  logout() {
    sessionStorage.clear();
    this.isLoggedin = false;
    this.reqs.logout().subscribe(() => {
      this.roter.navigate(['']);
    })
  }

}
