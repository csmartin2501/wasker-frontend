import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getListProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/GetListProducts`);
  }
}
