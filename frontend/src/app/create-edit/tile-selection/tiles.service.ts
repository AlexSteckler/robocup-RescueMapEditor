import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tile } from '../tile/dto/tile.dto';
import { Tiles } from '../tile/mock-tiles';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TilesService {
  constructor(private httpClient: HttpClient) {}

  getTiles(): Observable<Tile[]> {
    return this.httpClient.get<Tile[]>(`${environment.baseUrlV1}/tiles`);
  }

  getTileImg(source: string): Observable<Blob> {
    return this.httpClient.get(source, { responseType: 'blob' });
  }
}
