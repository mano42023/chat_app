import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiServiceService } from '../service/api-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  auth_error = '';

  constructor(private fb: FormBuilder, private reqs: ApiServiceService, private router: Router) {
    this.loginForm = fb.group({
      "username": ['', Validators.required],
      "password": ['', Validators.required],
    });
  }

  submit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value)
      this.reqs.login(this.loginForm.value).subscribe((res: any) => {
        if (res && res.hasOwnProperty('err')) {
          this.auth_error = res.msg;
        } else {
          this.auth_error = '';
          console.log(res);
          sessionStorage.setItem('token', res.token);
          let token: any = this.reqs.token_decode(res.token);
          if (token['role'] == 'admin') {
            this.router.navigate(['admin']).then(() => {
              window.location.reload();
            });
          } else {
            this.router.navigate(['home']).then(() => {
              window.location.reload();
            });
          }
        }
      })
    }
  }
}
