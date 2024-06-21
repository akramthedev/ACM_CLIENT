import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TachesRoutingModule } from './taches-routing.module';
import {TachesComponent} from './taches.component'


@NgModule({
  declarations: [TachesComponent],
  imports: [
    CommonModule,
    TachesRoutingModule
  ]
})
export class TachesModule { }
