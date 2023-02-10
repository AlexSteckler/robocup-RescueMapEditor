import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Map} from '../dto/map.dto';
import {Tile} from '../tile/dto/tile.dto';
import {environment} from '../../../environments/environment';
import { Obstacle } from '../obstacle/dto/obstacle.dto';

@Injectable({
  providedIn: 'root',
})
export class GridCanvasService {

  constructor(private httpClient: HttpClient) {
  }

  createMap(mapDto: any): Observable<Map> {
    return this.httpClient.post<Map>(`${environment.baseUrlV1}/map`, mapDto);
  }

  deleteMap(id: string) {
    return this.httpClient.delete<Map>(`${environment.baseUrlV1}/map/${id}`);
  }

  getMaps(): Observable<Map[]> {
    return this.httpClient.get<Map[]>(`${environment.baseUrlV1}/map`);
  }

  getMap(id: string) {
    return this.httpClient.get<Map>(`${environment.baseUrlV1}/map/${id}`);
  }

  getMapPublic(id: string) {
    return this.httpClient.get<Map>(`${environment.baseUrlV1}/map/${id}/public`);
  }

  updateMap(id: string, mapInfoDto: any) {
    return this.httpClient.patch<Map>(`${environment.baseUrlV1}/map/${id}`, mapInfoDto);
  }

  updateTile(
    id: string,
    layer: number,
    rowCount: number,
    colCount: number,
    tile: Tile
  ) {
    return this.httpClient.patch<Map>(
      `${environment.baseUrlV1}/map/${id}/tile/`,
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
  ) {
    return this.httpClient.patch<Map>(
      `${environment.baseUrlV1}/map/tile/${id}/delete`,
      {
        layer: layer,
        row: rowCount,
        column: colCount,
      }
    );
  }

  updateObstacle( mapId: string, dto: any) {
    return this.httpClient.patch<Map>(`${environment.baseUrlV1}/map/${mapId}/obstacle/`, dto);
  }

  deleteObstacle(mapId: string, obstacleId: string) {
    return this.httpClient.delete<Map>(
      `${environment.baseUrlV1}/map/${mapId}/obstacle/${obstacleId}`,
    );
  }

  updateEvacuationZone(
    id: string,
    layer: number,
    row: number,
    column: number,
    across: boolean,
    entry?: { x: number; y: number; position: number },
    exit?: { x: number; y: number; position: number }
  ) {
    return this.httpClient.patch<Map>(
      `${environment.baseUrlV1}/map/evacuation/${id}`,
      {
        id,
        layer,
        row,
        column,
        across,
        entry,
        exit,
      }
    );
  }

  deleteEvacuationZone(id: string) {
    return this.httpClient.delete<Map>(
      `${environment.baseUrlV1}/map/evacuation/${id}`
    );
  }


  getSize(id: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrlV1}/map/${id}/size`);
  }
}
