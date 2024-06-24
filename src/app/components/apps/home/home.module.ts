import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    NgApexchartsModule,
  ],
  declarations: [HomeComponent,]
})
export class ClientsModule { }
