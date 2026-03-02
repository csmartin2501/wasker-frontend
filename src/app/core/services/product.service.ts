import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getListProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/productos/GetListProducts`);
  }
}
