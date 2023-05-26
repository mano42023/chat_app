import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiServiceService } from '../service/api-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  auth_error = false;

  constructor(private fb: FormBuilder, private reqs: ApiServiceService) {
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
          console.log(res.msg)
        }
      })
    }
  }
}
