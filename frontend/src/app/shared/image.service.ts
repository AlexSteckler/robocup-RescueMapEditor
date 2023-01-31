import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Image } from './image.dto';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private httpClient: HttpClient) { }

  public getImg(source: string): Observable<Blob> {
    return this.httpClient.get(`${environment.baseUrlV1}/tile/image/${source}`,{ responseType: 'blob' });
  }

  public uploadImage(file: File): Observable<Image> {
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    return this.httpClient.post<Image>(`${environment.baseUrlV1}/tile/image`, formData);
  }
}
