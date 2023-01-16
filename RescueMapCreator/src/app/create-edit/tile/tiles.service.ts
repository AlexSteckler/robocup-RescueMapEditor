import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tile } from './dto/tile.dto';
import { Tiles } from './mock-tiles';
import { HttpClient } from "@angular/common/http";
import { TileComponent } from './tile.component';

@Injectable({
  providedIn: 'root'
})

export class TilesService {

  constructor(
    private httpClient : HttpClient
  )
  {}

  getTiles() : Observable<Tile[]>  {
    return of(Tiles);
  }

  getTileImg(source : string) : Observable<Blob> {
    return this.httpClient.get(source, {responseType: 'blob'});
  }
}
