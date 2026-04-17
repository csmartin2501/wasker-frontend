import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../core/services/cart.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  currentYear = new Date().getFullYear();
  totalCartItems$: Observable<number>;

  constructor(
    private cartService: CartService,
    public authService: AuthService
  ) {
    this.totalCartItems$ = this.cartService.totalItems$;
  }

  logout(): void {
    this.authService.logout();
  }
}
