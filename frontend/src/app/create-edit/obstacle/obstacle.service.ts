import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Obstacle } from './dto/obstacle.dto';

@Injectable({
  providedIn: 'root'
})
export class ObstacleService {

  constructor(private httpClient: HttpClient) {}

  public getObstacles(): Observable<Obstacle[]> {
    return this.httpClient.get<Obstacle[]>(`${environment.baseUrlV1}/obstacle`);
  }

  public createObstacle(dto:any): Observable<Obstacle> {
    return this.httpClient.post<Obstacle>(`${environment.baseUrlV1}/obstacle`, dto);
  }

  public updateObstacle(id: string, obstacleDto: any): Observable<Obstacle> {
    return this.httpClient.patch<Obstacle>(`${environment.baseUrlV1}/obstacle/${id}`, obstacleDto);
  }

  public deleteObstacle(id: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrlV1}/obstacle/${id}`);
  }


}
