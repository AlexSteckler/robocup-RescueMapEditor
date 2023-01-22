import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Map } from '../dto/map.dto';
import { Tile } from '../tile/dto/tile.dto';

@Injectable({
  providedIn: 'root',
})
export class GridCanvasService {
  constructor(private httpClient: HttpClient) {}

  createMap(name: string): Observable<Map> {
    return this.httpClient.post<Map>(`${environment.baseUrlV1}/map`, { name });
  }

  updateTile(
    id: string,
    layer: number,
    rowCount: number,
    colCount: number,
    tile: Tile
  ) {
    return this.httpClient.patch<Map>(
      `${environment.baseUrlV1}/map/tile/${id}`,
      {
        tilePosition: {
          tileId: tile.id,
          layer: layer,
          row: rowCount,
          column: colCount,
          rotation: tile.rotation,
        },
      }
    );
  }

  deleteTile(
    id: string,
    layer: number,
    rowCount: number,
    colCount: number,
    tile: Tile
  ) {
    return this.httpClient.patch<Map>(
      `${environment.baseUrlV1}/map/tile/${id}/delete`,
      {
        tilePosition: {
          tileId: tile.id,
          layer: layer,
          row: rowCount,
          column: colCount,
          rotation: tile.rotation,
        },
      }
    );
  }
}
