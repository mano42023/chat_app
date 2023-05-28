import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiServiceService } from '../service/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import { EditUserComponent } from '../edit-user/edit-user.component';

export interface UserData {
  _id: string;
  name: string;
  role: string;
  username: string;
}

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements AfterViewInit {
  users!: UserData[]
  displayedColumns: string[] = ['name', 'username', 'role', 'action'];
  dataSource!: MatTableDataSource<UserData>;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;

  constructor(private reqs: ApiServiceService, public dialog: MatDialog) {
    this.getUsers()
  }

  getUsers() {
    this.reqs.get_users().subscribe((res: any) => {
      this.users =[];
      if (res) {
        res.forEach((el: any) => {
          el['_id'] = el['_id']['$oid'];
          this.users.push(el);
        });
      }
      this.dataSource = new MatTableDataSource(this.users);
    })
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteUser(id: any) {
    console.log(id)
    this.reqs.deleteUser(id).subscribe((res: any) => {
      console.log(res);
      this.getUsers()
    })
  }

  updateUser(data: any) {
    let popup = this.dialog.open(EditUserComponent, {
      width: '30%',
      height: '75%',
      data: data
    });
    popup.afterClosed().subscribe(result => {
      this.getUsers();
    });
  }

}
