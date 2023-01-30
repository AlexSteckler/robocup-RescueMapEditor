import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tile } from '../tile/dto/tile.dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Image } from '../tile/dto/image.dto';

@Injectable({
  providedIn: 'root',
})
export class TilesService {
  constructor(private httpClient: HttpClient) {}

  public getTiles(): Observable<Tile[]> {
    return this.httpClient.get<Tile[]>(`${environment.baseUrlV1}/tile`);
  }

  public updateTile(id: string, tileDto: any): Observable<Tile> {
    return this.httpClient.patch<Tile>(`${environment.baseUrlV1}/tile/${id}`, tileDto);
  }

  public getTileImg(source: string): Observable<Blob> {
    return this.httpClient.get(`${environment.baseUrlV1}/tile/image/${source}`,{ responseType: 'blob' });
  }

  public createTile(dto: any): Observable<Tile>{
    return this.httpClient.post<Tile>(`${environment.baseUrlV1}/tile`, dto);
  }

  public uploadImage(file: File): Observable<Image> {
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    return this.httpClient.post<Image>(`${environment.baseUrlV1}/tile/image`, formData);
  }

  public deleteTile(id: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrlV1}/tile/${id}`);
  }
}
