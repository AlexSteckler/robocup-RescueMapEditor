import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Image } from './dto/image.dto';

@Injectable({
  providedIn: 'root'
})
export class CreateTileService {

  constructor(private httpClient: HttpClient) { }

  public uploadImage(file: File): Observable<Image> {
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    return this.httpClient.post<Image>(`${environment.baseUrlV1}/tile/image`, formData)
  }

  public createTile(dto: any) {
    return this.httpClient.post(`${environment.baseUrlV1}/tile`, dto)
  }
}
