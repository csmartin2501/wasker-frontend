import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './cart.component';
import { CartDetailComponent } from './components/cart-detail/cart-detail.component';

@NgModule({
  declarations: [
    CartComponent,
    CartDetailComponent
  ],
  imports: [
    CommonModule,
    CartRoutingModule,
    FormsModule,
    RouterModule
  ]
})
export class CartModule { }
