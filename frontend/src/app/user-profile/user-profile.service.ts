import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {UserRepresentation} from "./dto/UserRepresentation.dto";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private http: HttpClient) {
  }

  updateUserProfile(userProfileDto: any) {
    return this.http
      .patch<UserRepresentation>(`${environment.baseUrlV1}/admin/user`, userProfileDto);
  }

  deleteAll() {
    return this.http
      .delete<UserRepresentation>(`${environment.baseUrlV1}/admin`);
  }

  registerVolunteer(location: string) {
    return this.http
      .post<UserRepresentation>(`${environment.baseUrlV1}/admin/registerVolunteer`, {location});
  }

  getVolunteers() {
    return this.http
      .get<UserRepresentation[]>(`${environment.baseUrlV1}/admin/getVolunteers`);
  }

  setVolunteerRole(id: string) {
    return this.http
      .patch<UserRepresentation>(`${environment.baseUrlV1}/admin/setVolunteerRole`, {id});
  }

  deleteVolunteerRole(id: string) {
    return this.http
      .patch<UserRepresentation>(`${environment.baseUrlV1}/admin/deleteVolunteerRole`, {id});
  }
}
