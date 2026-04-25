import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartService } from '../core/services/cart.service';
import { AuthService } from '../core/services/auth.service';
import { MenuService } from '../core/services/menu.service';
import { Menu } from '../core/models/menu.interface';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  totalCartItems$: Observable<number>;
  menus: Menu[] = [];

  readonly iconos: { [id: number]: string } = {
    1: '🏠',
    2: '🛒',
    3: '📋',
    4: '👥',
    5: '📊',
    6: '🔑',
    7: '📦',
    8: '📋',
    9: '➕',
    10: '🏷️'
  };

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private menuService: MenuService
  ) {
    this.totalCartItems$ = this.cartService.totalItems$;
  }

  ngOnInit(): void {
    this.menuService.getMisMenus().pipe(
      catchError(() => of([]))
    ).subscribe(menus => this.menus = menus);
  }

  get topLevelMenus(): Menu[] {
    return this.menus.filter(m => !m.descripcion?.startsWith('/products'));
  }

  get productChildren(): Menu[] {
    return this.menus.filter(m => m.descripcion?.startsWith('/products'));
  }

  logout(): void {
    this.authService.logout();
  }
}
