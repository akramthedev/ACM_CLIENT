import { MaterialTabColorComponent } from './tabbed/material-tab-color/material-tab-color.component';
import { SimpleTabComponent } from './tabbed/simple-tab/simple-tab.component';
import { ColorTabComponent } from './tabbed/color-tab/color-tab.component';
import { ColorOptionComponent } from './tabbed/color-option/color-option.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { CardsRoutingModule } from './cards-routing.module';

import { BasicComponent } from './basic/basic.component';
import { CreativeComponent } from './creative/creative.component';
import { TabbedComponent } from './tabbed/tabbed.component';

@NgModule({
  declarations: [BasicComponent, CreativeComponent, TabbedComponent, ColorOptionComponent, ColorTabComponent, SimpleTabComponent, MaterialTabColorComponent],
  imports: [
    CommonModule,
    CardsRoutingModule,
    NgbModule,
    SharedModule,
  ]
})
export class CardsModule { }
