import { Component, Inject, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user-to-group',
  templateUrl: './add-user-to-group.component.html',
  styleUrls: ['./add-user-to-group.component.css']
})
export class AddUserToGroupComponent implements OnInit {
  users: any = [];
  prev_users: any = []
  selectedusers: any = []
  constructor(public MatDialogRef: MatDialogRef<AddUserToGroupComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private reqs: ApiServiceService,) {
    this.prev_users = data['group']['users']
  }

  ngOnInit(): void {
    this.reqs.get_users().subscribe((res: any) => {
      console.log(res)
      for (let i of res) {
        i['isChecked'] = this.prev_users.includes(i['username']) ? true : false;
        this.users.push(i)
      }
    })
  }

  addusers() {
    this.MatDialogRef.close(this.selectedusers);
  }

}
