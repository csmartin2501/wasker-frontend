import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { SalesListComponent } from './components/sales-list.component';
import { SalesDetailComponent } from './components/sales-detail.component';

@NgModule({
  declarations: [
    SalesComponent,
    SalesListComponent,
    SalesDetailComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    FormsModule
  ]
})
export class SalesModule { }
