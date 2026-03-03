import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart.component';
import { CartDetailComponent } from './components/cart-detail/cart-detail.component';

const routes: Routes = [
  {
    path: '',
    component: CartComponent,
    children: [
      {
        path: 'detail',
        component: CartDetailComponent
      },
      {
        path: '',
        redirectTo: 'detail',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
