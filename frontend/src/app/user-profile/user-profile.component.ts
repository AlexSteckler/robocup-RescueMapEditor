import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {KeycloakService} from "keycloak-angular";
import {KeycloakProfile} from "keycloak-js";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {NoWithSpaceValidator} from "../shared/noWithSpaceValidator";
import {UserProfileService} from "./user-profile.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  @ViewChild('basicModal') deleteConfirmModal: ElementRef | undefined;

  userProfile: KeycloakProfile | null = null;
  edit: boolean = false;
  roles: string[] = [];

  userForm: FormGroup = new FormGroup({
    firstname: new FormControl("", [Validators.required, NoWithSpaceValidator.noWhitespaceValidator]),
    lastname: new FormControl("", [Validators.required, NoWithSpaceValidator.noWhitespaceValidator]),
    mail: new FormControl("", [Validators.required, Validators.email, NoWithSpaceValidator.noWhitespaceValidator]),
    nickname: new FormControl("", [Validators.required, NoWithSpaceValidator.noWhitespaceValidator]
    )
  });

  constructor(
    private toastr: ToastrService,
    private keycloakService: KeycloakService,
    private router: Router,
    private userProfileService: UserProfileService,
    private modalService: NgbModal,
  ) {
  }

  async ngOnInit() {
    this.userProfile = await this.keycloakService.loadUserProfile();
    this.roles = this.keycloakService.getUserRoles()
  }

  editValues() {
    this.edit = true;
    this.userForm.patchValue({
      firstname: this.userProfile?.firstName,
      lastname: this.userProfile?.lastName,
      mail: this.userProfile?.email,
      nickname: this.userProfile?.username
    });
  }

  save() {
    if (!this.userForm.valid) {
      Object.keys(this.userForm.controls).forEach(field => {
        if (this.userForm.controls[field].invalid) {
          this.userForm.controls[field].setErrors({incorrect: true});
        }
      });
      return;
    }
    const userProfileDto = {
      firstName: this.userForm.get('firstname')?.value,
      lastName: this.userForm.get('lastname')?.value,
      email: this.userForm.get('mail')?.value,
      username: this.userForm.get('nickname')?.value,
    }
    this.userProfileService.updateUserProfile(userProfileDto).subscribe(() => window.location.reload())
  }

  deleteAccount() {
    this.modalService.open(this.deleteConfirmModal, {centered: true})
      .result
      .then((result) => {
        this.userProfileService.deleteAll().subscribe(() => {
          this.keycloakService.logout()
        });
      }, (reason) => {
        this.toastr.warning(`Account wurde nicht gelöscht`, 'Löschen abgebrochen');
      });
  }
}
