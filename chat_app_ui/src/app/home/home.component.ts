import { Component } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import { AddUserToGroupComponent } from '../add-user-to-group/add-user-to-group.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  groups: any = [];
  messages: any = [];
  show_group = false;
  groupname: any;
  selected_group: any;
  selected_users: any;
  message: any;
  username: any
  constructor(private reqs: ApiServiceService, public dialog: MatDialog) {
    this.getGroups();
    let token = sessionStorage.getItem('token')
    let userdetails: any = this.reqs.token_decode(token);
    this.username = userdetails['username']
  }

  getGroups() {
    this.reqs.get_groups().subscribe((res: any) => {
      console.log(res)
      this.groups = [];
      if (res.length) {
        res.forEach((el: any) => {
          el['_id'] = el['_id']['$oid'];
          this.groups.push(el);
        });
      }
    })
  }

  message_req(group_name: any) {
    this.reqs.get_messages(group_name).subscribe((res: any) => {
      console.log(res)
      if ('messages' in res) {
        this.messages = res['messages'];
      }
    })
  }

  getMessages(group: any) {
    this.messages = [];
    this.selected_group = group;
    this.message_req(group.group_name)
  }

  createGroups() {
    if (this.groupname) {
      console.log(this.groupname)
      this.reqs.createGroup({ "group_name": this.groupname }).subscribe((res: any) => {
        console.log(res)
        this.getGroups()
      })
    }
  }

  addUsertoGroup() {
    console.log('test');
    let popup = this.dialog.open(AddUserToGroupComponent, {
      width: '30%',
      height: '75%',
      data: { "group": this.selected_group }
    });
    popup.afterClosed().subscribe(result => {
      console.log(result);
      if (result.length) {
        this.reqs.addUserGroup({ "group_name": this.selected_group.group_name, "username": result }).subscribe((res: any) => {
          console.log(res)
          this.getGroups()
        })
      }
    });

  }

  sendMessage() {
    this.reqs.sendMessage({ "group_name": this.selected_group.group_name, 'message': this.message }).subscribe((res: any) => {
      console.log(res);
      this.message = '';
      this.message_req(this.selected_group.group_name)
    })
  }

}
