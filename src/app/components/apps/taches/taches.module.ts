import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TachesRoutingModule } from './taches-routing.module';
import {TachesComponent} from './taches.component'
import { SharedModule } from "../../../shared/shared.module";


@NgModule({
    declarations: [TachesComponent],
    imports: [
        CommonModule,
        TachesRoutingModule,
        SharedModule
    ]
})
export class TachesModule { }
