import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { ClientsRoutingModule } from './clients-routing.module';

import { ClientsComponent } from './clients.component';
import { AddClientComponent } from './modal/add-client/add-client.component';
import { AddCategoryComponent } from './modal/add-category/add-category.component';
import { PrintContactComponent } from './modal/print-contact/print-contact.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ClientsRoutingModule
  ],
  declarations: [ClientsComponent, AddClientComponent, AddCategoryComponent, PrintContactComponent]
})
export class ClientsModule { }
