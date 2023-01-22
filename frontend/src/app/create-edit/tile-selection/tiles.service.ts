import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tile } from '../tile/dto/tile.dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TilesService {
  constructor(private httpClient: HttpClient) {}

  getTiles(): Observable<Tile[]> {
    return this.httpClient.get<Tile[]>(`${environment.baseUrlV1}/tile`);
  }

  getTileImg(source: string): Observable<Blob> {
    return this.httpClient.get(
      `${environment.baseUrlV1}/tile/image/${source}`,
      { responseType: 'blob' }
    );
  }
}
