import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductsComponent } from './products.component';

@NgModule({
  declarations: [
    ProductFormComponent,
    ProductListComponent,
    ProductsComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ProductsModule { }