import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {UserRepresentation} from "../user-profile/dto";
import {UserProfileService} from "../user-profile/user-profile.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.scss']
})
export class VolunteersComponent {
  @ViewChild('chooseModal') chooseModal: ElementRef | undefined;
  dataSource = new MatTableDataSource<UserRepresentation>();
  displayedColumns: string[] = ['firstname', 'lastname', 'email', 'verified', 'action'];
  currentUserRepresentation: UserRepresentation | null = null;

  constructor(
    private userService: UserProfileService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.userService.getVolunteers().subscribe((userRepresentations: UserRepresentation[]) => this.dataSource.data = userRepresentations);
  }

  openChosenModal(userRepresentation: UserRepresentation) {
    this.currentUserRepresentation = userRepresentation;
    this.modalService.open(this.chooseModal, {centered: true})
      .result
      .then((result) => {
        let index = this.dataSource.data.findIndex((user: UserRepresentation) => user.id === userRepresentation.id!);
        const tmp = this.dataSource.data;
        if (result === 'verify') {
          this.userService.setVolunteerRole(userRepresentation.id!).subscribe((user) => {
            if (index > -1) {
              tmp.splice(index, 1, user);
              this.dataSource.data = tmp;
              this.toastr.success(`Volunteer wurde freigegeben`, 'Änderung erfolgreich');
            }
          });
        } else {
          this.userService.deleteVolunteerRole(userRepresentation.id!).subscribe((user) => {
            if (index > -1) {
              tmp.splice(index, 1, user);
              this.dataSource.data = tmp;
              this.toastr.success(`Volunteer wurde gesperrt`, 'Änderung erfolgreich');
            }
          });
        }
      }, (reason) => {
        this.toastr.warning(`Status wurde nicht geändert`, 'Aktion abgebrochen');
      });
  }

}
