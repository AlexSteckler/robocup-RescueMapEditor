import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category } from './dto/category.dto';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private httpClient: HttpClient) { }

  public getAllCategorys(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${environment.baseUrlV1}/category`);
  }

  public createCategory(dto:any): Observable<Category> {
    return this.httpClient.post<Category>(`${environment.baseUrlV1}/category`, dto);
  }

  public deleteCategory(id: string): Observable<Category> {
    return this.httpClient.delete<Category>(`${environment.baseUrlV1}/category/${id}`);
  }

}
