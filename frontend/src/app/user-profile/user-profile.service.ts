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

  registerMapper(location: string) {
    return this.http
      .post<UserRepresentation>(`${environment.baseUrlV1}/admin/registerMapper`, {location});
  }

  getMapper() {
    return this.http
      .get<UserRepresentation[]>(`${environment.baseUrlV1}/admin/getMapper`);
  }

  setMapperRole(id: string) {
    return this.http
      .patch<UserRepresentation>(`${environment.baseUrlV1}/admin/setMapperRole`, {id});
  }

  deleteMapperRole(id: string) {
    return this.http
      .patch<UserRepresentation>(`${environment.baseUrlV1}/admin/deleteMapperRole`, {id});
  }
}
