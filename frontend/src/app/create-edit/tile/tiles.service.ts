import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tile } from './dto/tile.dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Image } from '../../shared/image.dto';

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

  public createTile(dto: any): Observable<Tile>{
    return this.httpClient.post<Tile>(`${environment.baseUrlV1}/tile`, dto);
  }

  public deleteTile(id: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrlV1}/tile/${id}`);
  }
}
