import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiServiceService } from '../service/api-service.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent {
  userForm!: FormGroup
  show_pass = false;
  constructor(public MatDialogRef: MatDialogRef<EditUserComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private reqs: ApiServiceService,) {
    this.userForm = fb.group({
      "_id": [''],
      "username": ['', Validators.required],
      "name": ['', Validators.required],
      "role": ['', Validators.required],
    });
    console.log(data)
    if (Object.keys(data).length) {
      this.userForm.patchValue(data);
    }
    else {
      this.userForm.addControl('password', fb.control('', Validators.required))
      this.show_pass = true
    }
  }

  submit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
      if (this.show_pass) { 
        this.reqs.createUser(this.userForm.value).subscribe((res: any) => {
          alert(res.msg);
          this.MatDialogRef.close()
        })
      }
      else {
        this.reqs.updateUser(this.userForm.value).subscribe((res: any) => {
          alert(res.msg);
          this.MatDialogRef.close()
        })
      }
    }
  }

}
