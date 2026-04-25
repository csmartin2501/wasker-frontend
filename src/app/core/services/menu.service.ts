import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Menu } from '../models/menu.interface';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private http: HttpClient) {}

  getMisMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${environment.apiUrl}/menus/mis-menus`);
  }
}
